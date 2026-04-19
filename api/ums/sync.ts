import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as cheerio from 'cheerio';
import qs from 'qs';
import { TimetableData, DaySchedule } from '../../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, username, password, captchaCode, hiddenFields, cookies, captchaInputName } = req.body;

  const client = axios.create({
    baseURL: 'https://ums.lpu.in/lpuums/',
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    maxRedirects: 5,
  });

  // ACTION: INIT
  if (action === 'init') {
    try {
      const loginPageRes = await client.get('/');
      const $login = cheerio.load(loginPageRes.data);

      const fields = {
        __VIEWSTATE: String($login('#__VIEWSTATE').val() || ''),
        __VIEWSTATEGENERATOR: String($login('#__VIEWSTATEGENERATOR').val() || ''),
        __EVENTVALIDATION: String($login('#__EVENTVALIDATION').val() || ''),
      };

      // Find Captcha image and input name
      const captchaImg = $login('img[id*="Captcha"], img[src*="Captcha"]').first();
      let captchaUrl = captchaImg.attr('src') || '';
      
      // The input is usually the nearest text field or one with 'CaptchaCode' in its ID
      let foundInputName = $login('input[id*="CaptchaCode"]').attr('name') || 
                           $login('input[id*="Captha"]').attr('name') || 
                           'TxtCapthaAutoId_9879'; // Fallback

      if (captchaUrl && !captchaUrl.startsWith('http')) {
        captchaUrl = new URL(captchaUrl, 'https://ums.lpu.in/lpuums/').href;
      }

      const currentCookies = loginPageRes.headers['set-cookie']?.join('; ') || '';

      let captchaBase64 = '';
      if (captchaUrl) {
        const captchaRes = await client.get(captchaUrl, {
          responseType: 'arraybuffer',
          headers: { Cookie: currentCookies }
        });
        captchaBase64 = `data:image/png;base64,${Buffer.from(captchaRes.data).toString('base64')}`;
      }

      return res.status(200).json({
        success: true,
        captchaImage: captchaBase64,
        hiddenFields: fields,
        cookies: currentCookies,
        captchaInputName: foundInputName
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to reach UMS', details: error.message });
    }
  }

  // ACTION: SYNC
  if (action === 'sync') {
    if (!username || !password || !captchaCode || !hiddenFields || !cookies) {
      return res.status(400).json({ error: 'Missing sync data' });
    }

    try {
      const payload: any = {
        ...hiddenFields,
        __EVENTTARGET: '',
        __EVENTARGUMENT: '',
        txtUserName: username,
        txtPassword: password,
        btnLogin: 'Login',
        ddlStartPage: 'StudentDashboard.aspx'
      };

      // Add captcha with the detected name
      payload[captchaInputName || 'TxtCapthaAutoId_9879'] = captchaCode;

      const loginPostRes = await client.post('Login.aspx', qs.stringify(payload), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': cookies,
        },
      });

      if (loginPostRes.data.includes('Invalid User Name or Password') || loginPostRes.data.includes('Invalid Captcha')) {
        return res.status(401).json({ error: loginPostRes.data.includes('Captcha') ? 'Invalid Captcha' : 'Invalid Credentials' });
      }

      const nextCookies = loginPostRes.headers['set-cookie']?.join('; ') || cookies;

      // Verify login success
      const dashboardRes = await client.get('StudentDashboard.aspx', { headers: { Cookie: nextCookies } });
      if (!dashboardRes.data.includes('lblStudentName')) {
        return res.status(401).json({ error: 'Session expired or login failed' });
      }

      const $dash = cheerio.load(dashboardRes.data);
      const studentName = $dash('#lblStudentName').text().trim();
      
      // Parse Attendance
      const attendance: any[] = [];
      $dash('#AttSummary tr:not(:first-child)').each((_, el) => {
        const cols = $dash(el).find('td');
        if (cols.length >= 7) {
          const match = $dash(cols[7]).text().trim().match(/(\d+)\/(\d+)/);
          if (match) {
            attendance.push({
              id: Math.random().toString(36).substring(2, 11),
              name: $dash(cols[1]).text().trim(),
              present: parseInt(match[1]),
              total: parseInt(match[2]),
              goal: 75
            });
          }
        }
      });

      // Parse Timetable
      const timetableRes = await client.get('Reports/frmStudentTimeTable.aspx', { headers: { Cookie: nextCookies } });
      const $tt = cheerio.load(timetableRes.data);
      const schedule: DaySchedule[] = Array.from({ length: 6 }, (_, i) => ({ 
        day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i], 
        slots: [] 
      }));

      $tt('table.Gridview-Class tr:not(:first-child)').each((_, row) => {
        const timeCell = $tt(row).find('td').first().text().trim();
        const timeMatch = timeCell.match(/(\d+:\d+\s+[AP]M)\s*-\s*(\d+:\d+\s+[AP]M)/);
        if (timeMatch) {
          $tt(row).find('td:not(:first-child)').each((colIndex, col) => {
            const lines = $tt(col).text().trim().split('\n').map(l => l.trim()).filter(l => l);
            if (lines.length > 0 && schedule[colIndex]) {
              schedule[colIndex].slots.push({
                id: Math.random().toString(36).substring(2, 11),
                subject: lines[0],
                room: lines[1]?.replace(/[()]/g, '') || 'N/A',
                startTime: timeMatch[1],
                endTime: timeMatch[2],
                type: 'class'
              });
            }
          });
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          profile: { name: studentName, regNo: username },
          attendance,
          timetable: { ownerName: studentName, ownerId: username, schedule }
        }
      });
    } catch (e: any) {
      return res.status(500).json({ error: 'Sync error', details: e.message });
    }
  }

  return res.status(400).json({ error: 'Invalid action' });
}

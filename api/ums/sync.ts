import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as cheerio from 'cheerio';
import qs from 'qs';
import { TimetableData, DaySchedule } from '../../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const client = axios.create({
    baseURL: 'https://ums.lpu.in/lpuums/',
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    maxRedirects: 5,
  });

  try {
    // 1. Get Login Page to extract hidden ASP.NET fields
    const loginPageRes = await client.get('Login.aspx');
    const $login = cheerio.load(loginPageRes.data);
    
    const hiddenFields = {
      __VIEWSTATE: String($login('#__VIEWSTATE').val() || ''),
      __VIEWSTATEGENERATOR: String($login('#__VIEWSTATEGENERATOR').val() || ''),
      __EVENTVALIDATION: String($login('#__EVENTVALIDATION').val() || ''),
      __EVENTTARGET: '',
      __EVENTARGUMENT: '',
      txtUserName: username,
      txtPassword: password,
      ddlStartPage: 'StudentDashboard.aspx',
      btnLogin: 'Login'
    };

    // 2. Perform Login
    const loginPostRes = await client.post('Login.aspx', qs.stringify(hiddenFields), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': loginPageRes.headers['set-cookie']?.join('; ') || '',
      },
    });

    const cookies = loginPostRes.headers['set-cookie']?.join('; ') || loginPageRes.headers['set-cookie']?.join('; ') || '';

    // 3. Check if login was successful (usually redirects to StudentDashboard.aspx)
    if (loginPostRes.data.includes('Invalid User Name or Password')) {
      return res.status(401).json({ error: 'Invalid UMS credentials' });
    }

    // 4. Fetch Attendance from Dashboard
    const dashboardRes = await client.get('StudentDashboard.aspx', {
      headers: { Cookie: cookies }
    });
    
    const $dash = cheerio.load(dashboardRes.data);
    const attendance: any[] = [];
    
    // Attempting to parse the attendance summary table
    $dash('#AttSummary tr:not(:first-child)').each((_, el) => {
      const cols = $dash(el).find('td');
      if (cols.length >= 7) {
        const name = $dash(cols[1]).text().trim();
        const attendanceData = $dash(cols[7]).text().trim();
        
        let present = 0;
        let total = 0;
        
        const match = attendanceData.match(/(\d+)\/(\d+)/);
        if (match) {
          present = parseInt(match[1]);
          total = parseInt(match[2]);
        } else {
          const pctText = $dash(cols[8]).text().trim();
          const pct = parseFloat(pctText) || 0;
          present = Math.round((pct / 100) * 10);
          total = 10;
        }

        if (name) {
          attendance.push({
            id: Math.random().toString(36).substring(2, 11),
            name: name,
            present,
            total,
            goal: 75
          });
        }
      }
    });

    // 5. Fetch Timetable
    const timetableRes = await client.get('Reports/frmStudentTimeTable.aspx', {
      headers: { Cookie: cookies }
    });
    
    const $tt = cheerio.load(timetableRes.data);
    const schedule: DaySchedule[] = [
      { day: 'Monday', slots: [] },
      { day: 'Tuesday', slots: [] },
      { day: 'Wednesday', slots: [] },
      { day: 'Thursday', slots: [] },
      { day: 'Friday', slots: [] },
      { day: 'Saturday', slots: [] },
    ];

    $tt('table.Gridview-Class tr:not(:first-child)').each((_, row) => {
      const timeCell = $tt(row).find('td').first().text().trim();
      const timeMatch = timeCell.match(/(\d+:\d+\s+[AP]M)\s*-\s*(\d+:\d+\s+[AP]M)/);
      
      if (timeMatch) {
        const startTime = timeMatch[1];
        const endTime = timeMatch[2];

        $tt(row).find('td:not(:first-child)').each((colIndex, col) => {
          const content = $tt(col).text().trim();
          if (content && content.length > 5) {
            const lines = content.split('\n').map(l => l.trim()).filter(l => l);
            const subject = lines[0] || 'Unknown';
            const room = lines[1]?.replace(/[()]/g, '') || 'N/A';

            if (schedule[colIndex]) {
              schedule[colIndex].slots.push({
                id: Math.random().toString(36).substring(2, 11),
                subject,
                room,
                startTime,
                endTime,
                type: 'class'
              });
            }
          }
        });
      }
    });

    const rawStudentName = $dash('#lblStudentName').text().trim() || 'Verto Student';
    const formattedName = rawStudentName.split(' ')
      .map(n => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase())
      .join(' ');

    const timetable: TimetableData = {
      ownerName: formattedName,
      ownerId: username,
      schedule
    };

    return res.status(200).json({
      success: true,
      data: {
        profile: {
          name: formattedName,
          regNo: username,
        },
        attendance,
        timetable
      }
    });

  } catch (error: any) {
    console.error('UMS Sync Error:', error.message);
    return res.status(500).json({ 
      error: 'Failed to connect to UMS. Please try again later.',
      details: error.message 
    });
  }
}


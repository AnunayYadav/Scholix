
export interface ContactInfo {
    id: string;
    title: string;
    category: 'Hostel' | 'Doctor' | 'Nursing' | 'Counseling' | 'Facility' | 'Hospital' | 'Administrative' | 'Support' | 'Women Support' | 'Fire & Safety' | 'Accounts' | 'Student Relations';
    subTitle?: string;
    description?: string;
    numbers: string[];
    availability?: string;
    email?: string;
    blocks?: { label: string; number: string }[];
}

export const coreContacts = [
    {
        title: "Fire & Safety Cell",
        status: "24×7",
        numbers: ["01824-444201", "7508183870"],
        color: "from-[#450a0a] via-[#991b1b] to-[#dc2626]",
        iconType: 'fire'
    },
    {
        title: "Hospital Reception",
        status: "24×7",
        numbers: ["01824-444079", "01824-501227"],
        color: "from-[#003049] to-[#0077b6]",
        iconType: 'hospital'
    },
    {
        title: "Women Help Center",
        status: "9AM - 5PM",
        numbers: ["9915020408", "01824-444040"],
        color: "from-[#4c0519] to-[#881337]",
        iconType: 'women'
    }
];

export const allDirectory: ContactInfo[] = [
    // Hostels BH
    { id: 'bh1', title: 'BH-1', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['9915020442'], blocks: [{ label: 'Main Line', number: '01824444521' }] },
    { id: 'bh2', title: 'BH-2', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['9888598705'], blocks: [{ label: 'Main Line', number: '01824444524' }] },
    { id: 'bh3', title: 'BH-3', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['9915710553'], blocks: [{ label: 'Main Line', number: '01824444526' }] },
    { id: 'bh4', title: 'BH-4', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['9876015107'], blocks: [{ label: 'Main Line', number: '01824444529' }] },
    { id: 'bh5', title: 'BH-5', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['9780036434'], blocks: [{ label: 'Main Line', number: '01824444530' }] },
    { id: 'bh6', title: 'BH-6', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['9501110445'], blocks: [{ label: 'Main Line', number: '01824444532' }] },
    { id: 'bh7', title: 'BH-7', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['7508182896'], blocks: [{ label: 'Reception', number: '01824444536' }] },
    { id: 'bh8', title: 'BH-8', category: 'Hostel', subTitle: 'Boys Hostel', numbers: ['9780005942'], blocks: [{ label: 'Reception', number: '01824444528' }] },
    { id: 'apartment', title: 'BH Apartment', category: 'Hostel', subTitle: 'Boys Apt', numbers: ['9878977900'], blocks: [{ label: 'Main Line', number: '01824444520' }] },

    // Hostels GH
    { id: 'gh1', title: 'GH-1', category: 'Hostel', subTitle: 'Girls Hostel', numbers: ['9915020443'], blocks: [{ label: 'Reception', number: '01824444081' }] },
    { id: 'gh2', title: 'GH-2', category: 'Hostel', subTitle: 'Girls Hostel', numbers: ['9876644335'], blocks: [{ label: 'Reception', number: '01824444082' }] },
    { id: 'gh3', title: 'GH-3', category: 'Hostel', subTitle: 'Girls Hostel', numbers: ['9876740090'], blocks: [{ label: 'Reception', number: '01824444083' }] },
    { id: 'gh4', title: 'GH-4', category: 'Hostel', subTitle: 'Girls Hostel', numbers: ['9915020444'], blocks: [{ label: 'Reception', number: '01824444084' }] },
    { id: 'gh5', title: 'GH-5', category: 'Hostel', subTitle: 'Girls Hostel', numbers: ['9876015106'], blocks: [{ label: 'Main Line', number: '0182444303' }] },
    { id: 'gh6', title: 'GH-6', category: 'Hostel', subTitle: 'Girls Hostel', numbers: ['9915020439'], blocks: [{ label: 'Main Line', number: '0182444301' }] },

    // Doctors (Updated & Expanded)
    { id: 'nk_gupta', title: 'Dr. N.K. Gupta', subTitle: 'Eye Specialist | Medical Officer', category: 'Doctor', numbers: ['9878426871', '9815023005'], availability: '4 PM – 8 PM' },
    { id: 'vijay_mohan', title: 'Dr. Vijay Mohan', subTitle: 'Resident Medical Officer', category: 'Doctor', numbers: ['9878426880'], availability: '24 hrs (8 hr shift)' },
    { id: 'ajay_arneja', title: 'Dr. Ajay Arneja', subTitle: 'Dental (Part-Time)', category: 'Doctor', numbers: ['9914033108'], availability: '4 PM – 8 PM' },
    { id: 'harjeet_singh', title: 'Dr. Harjeet Singh', subTitle: 'Medical Officer', category: 'Doctor', numbers: ['9815760306'] },
    { id: 'navneet_singh', title: 'Dr. Navneet Singh', subTitle: 'Resident Medical Officer', category: 'Doctor', numbers: ['8264557767'] },
    { id: 'anil_malhotra', title: 'Dr. Anil Malhotra', subTitle: 'Medical Officer', category: 'Doctor', numbers: ['9815364977'], availability: '2 PM – 10 PM' },
    { id: 'reyhan_ahmad', title: 'Dr. Reyhan Ahmad Sheikh', subTitle: 'Resident Medical Officer', category: 'Doctor', numbers: ['6005932395'] },
    { id: 'santosh_daniel', title: 'Dr. Santosh Daniel', subTitle: 'Resident Medical Officer', category: 'Doctor', numbers: ['9944838602'] },

    // Visiting Doctors
    { id: 'mamta_arora', title: 'Dr. Mamta Arora', subTitle: 'Skin Specialist', category: 'Doctor', numbers: ['8146580816'], availability: 'Thursday 4 PM – 6 PM', description: 'Visiting Consultant' },
    { id: 'shweta_b', title: 'Shweta Bharadwaj', subTitle: 'Psychologist', category: 'Counseling', numbers: ['01824-444079'], availability: 'Tue 4-6PM | Sat 11AM-1PM', description: 'Visiting Consultant' },
    { id: 'vandana_l', title: 'Dr. Vandana Lalwani', subTitle: 'Gynecologist', category: 'Doctor', numbers: ['9814857075'], availability: 'Tue & Fri 4 PM – 6 PM', description: 'Visiting Consultant' },

    // Counseling Psychologists (9 AM – 5:30 PM)
    { id: 'counseling_neha', title: 'Ms. Neha Sharma', category: 'Counseling', numbers: ['01824-444509'], subTitle: 'Counseling Psychologist' },
    { id: 'counseling_anusuya', title: 'Ms. Anusuya Hazarika', category: 'Counseling', numbers: ['01824-444509'], subTitle: 'Counseling Psychologist' },
    { id: 'counseling_babita', title: 'Ms. Babita', category: 'Counseling', numbers: ['01824-444509'], subTitle: 'Counseling Psychologist' },
    { id: 'counseling_anuradha', title: 'Ms. Anuradha', category: 'Counseling', numbers: ['01824-444509'], subTitle: 'Counseling Psychologist' },

    // Nursing Staff Male (24 hrs)
    { id: 'nurse_lp', title: 'Lovepreet Singh', category: 'Nursing', numbers: ['9914550656'], subTitle: 'Male Nursing Staff' },
    { id: 'nurse_jd', title: 'Jagdeep Singh', category: 'Nursing', numbers: ['9780036450'], subTitle: 'Male Nursing Staff' },
    { id: 'nurse_dr', title: 'Davinder Ram', category: 'Nursing', numbers: ['8284896636'], subTitle: 'Male Nursing Staff' },
    { id: 'nurse_js', title: 'Jagsir Singh', category: 'Nursing', numbers: ['7888339220'], subTitle: 'Male Nursing Staff' },
    { id: 'nurse_nk', title: 'Naveen Kumar', category: 'Nursing', numbers: ['8700219223'], subTitle: 'Male Nursing Staff' },
    { id: 'nurse_gs', title: 'Gurjeet Singh', category: 'Nursing', numbers: [], subTitle: 'Male Nursing Staff' },

    // Nursing Staff Female (24 hrs)
    { id: 'nurse_ab', title: 'Anu Bala', category: 'Nursing', numbers: ['8360751806'], subTitle: 'Female Nursing Staff' },
    { id: 'nurse_mk', title: 'Manpreet Kaur', category: 'Nursing', numbers: ['8427178725'], subTitle: 'Female Nursing Staff' },
    { id: 'nurse_hk', title: 'Harvinder Kaur', category: 'Nursing', numbers: ['6280830590'], subTitle: 'Female Nursing Staff' },
    { id: 'nurse_rj', title: 'Rajpinder', category: 'Nursing', numbers: ['6284518196'], subTitle: 'Female Nursing Staff' },
    { id: 'nurse_mandeep', title: 'Mandeep Kaur', category: 'Nursing', numbers: ['9592571889'], subTitle: 'Female Nursing Staff' },
    { id: 'nurse_monika', title: 'Monika Rani', category: 'Nursing', numbers: ['9056134867'], subTitle: 'Female Nursing Staff' },
    { id: 'nurse_mamta_k', title: 'Mamta Kumari', category: 'Nursing', numbers: ['8626877236'], subTitle: 'Female Nursing Staff' },
    { id: 'nurse_priyanka', title: 'Priyanka Devi', category: 'Nursing', numbers: ['7831009173'], subTitle: 'Female Nursing Staff' },
    { id: 'nurse_karamjit', title: 'Karamjit', category: 'Nursing', numbers: ['7889114351'], subTitle: 'Female Nursing Staff' },
    { id: 'nurse_jaspreet', title: 'Jaspreet Kaur', category: 'Nursing', numbers: ['8699621305'], subTitle: 'Female Nursing Staff' },
    { id: 'nurse_sajita', title: 'Sajita Kumari', category: 'Nursing', numbers: ['9779076679'], subTitle: 'Female Nursing Staff' },

    // Ward Staff
    { id: 'ward_lady1', title: 'Rajinder Kaur', category: 'Nursing', numbers: ['7973370167'], subTitle: 'Ward Lady' },
    { id: 'ward_lady2', title: 'Bholi', category: 'Nursing', numbers: ['8968974206'], subTitle: 'Ward Lady' },
    { id: 'ward_boy1', title: 'Rajesh Narayan', category: 'Nursing', numbers: ['8054618366'], subTitle: 'Ward Boy' },
    { id: 'ward_boy2', title: 'Ghanshyam', category: 'Nursing', numbers: ['8283808959'], subTitle: 'Ward Boy' },
    { id: 'ward_boy3', title: 'Krishan Kumar', category: 'Nursing', numbers: ['9888210919'], subTitle: 'Ward Boy' },

    // Facilities & Admin
    { id: 'hc_reception', title: 'HC Reception', subTitle: 'Help Line', category: 'Facility', numbers: ['018244-44079', '018245-01227'], availability: '24x7', description: 'If unreachable: Dr. Anil (9815364977) or Dr. Vijay (9878426880)' },
    { id: 'cabin1', title: 'Cabin 1', category: 'Facility', numbers: ['018244-44071'], subTitle: 'Health Centre' },
    { id: 'cabin2', title: 'Cabin 2', category: 'Facility', numbers: ['018244-44072'], subTitle: 'Health Centre' },
    { id: 'cabin3', title: 'Cabin 3', category: 'Facility', numbers: ['018244-44073'], subTitle: 'Health Centre' },
    { id: 'cabin4', title: 'Cabin 4', category: 'Facility', numbers: ['018244-44074'], subTitle: 'Health Centre' },
    { id: 'cabin5', title: 'AO Cabin 5', category: 'Facility', numbers: ['018244-44076'], subTitle: 'Health Centre' },
    { id: 'cabin6', title: 'Cabin 6', category: 'Facility', numbers: ['018244-95015'], subTitle: 'Health Centre' },
    { id: 'cabin7', title: 'Cabin 7', category: 'Facility', numbers: ['018244-44077'], subTitle: 'Health Centre' },
    { id: 'cabin8', title: 'Cabin 8', category: 'Facility', numbers: ['018244-95016'], subTitle: 'Health Centre' },
    { id: 'hc_male_ward', title: 'Male Ward', category: 'Facility', numbers: ['018244-44066'], subTitle: 'HC Indoor' },
    { id: 'hc_female_ward', title: 'Female Ward', category: 'Facility', numbers: ['018244-44067'], subTitle: 'HC Indoor' },
    { id: 'hc_store', title: 'Medical Store', subTitle: '24x7 Subsidized', category: 'Facility', numbers: ['018244-44068'] },
    { id: 'hc_lab', title: 'Medical Laboratory', subTitle: 'Diagnostics', category: 'Facility', numbers: ['018244-44069'] },

    // Referral Hospitals
    { id: 'ref_doaba', title: 'Doaba Hosp', subTitle: 'Jalandhar City', category: 'Hospital', numbers: ['0181-2226200'], description: 'Specialized Emergency Care' },
    { id: 'patel_hosp', title: 'Patel Hospital', subTitle: 'Cancer & Surgical', category: 'Hospital', numbers: ['0181-5241000'], description: 'Multi-specialty Referral' },
    { id: 'bbc_heart', title: 'BBC Heart Care', subTitle: 'Cardiac Center', category: 'Hospital', numbers: ['0181-2226227'], description: 'Advanced Heart Care' },
    { id: 'johal_hosp', title: 'Johal Hospital', subTitle: '24x7 Emergency', category: 'Hospital', numbers: ['0181-5011110'], description: 'Trauma & Ortho' },
    { id: 'capitol', title: 'Capitol Hospital', subTitle: 'Jalandhar', category: 'Hospital', numbers: ['0181-5038000'], description: 'Global Healthcare' },
    { id: 'sacred_heart', title: 'Sacred Heart', subTitle: 'General Support', category: 'Hospital', numbers: ['0181-2670390'], description: 'Charitable Healthcare' },
    { id: 'civil_phag', title: 'Civil Phagwara', subTitle: 'Govt Support', category: 'Hospital', numbers: ['01824-260275'], description: 'Phagwara City Hospital' },

    // Women Help Center & Safety Cell (9 AM - 5 PM)
    { id: 'monica_gulati', title: 'Dr. Monica Gulati', category: 'Women Support', numbers: ['9915020408'], blocks: [{ label: 'Landline', number: '01824-444040' }], subTitle: 'Women Help Center' },
    { id: 'ravinder_kaur', title: 'Mrs. Ravinder Kaur', category: 'Women Support', numbers: ['9878977800'], blocks: [{ label: 'Landline', number: '01824-444235' }], subTitle: 'Women Help Center' },
    { id: 'nirpaljeet_kaur', title: 'Ms. Nirpaljeet Kaur', category: 'Women Support', numbers: ['7986757060'], subTitle: 'Women Help Center' },
    { id: 'surinder_khurana_women', title: 'Mr. Surinder Khurana', category: 'Women Support', numbers: ['9876644331'], blocks: [{ label: 'Landline', number: '01824-444097' }], subTitle: 'Women Help Center' },

    // Fire and Safety Cell (24x7)
    { id: 'fire_safety_office', title: 'Office of Fire & Safety', category: 'Fire & Safety', numbers: [], blocks: [{ label: 'Landline 24x7', number: '01824-444201' }], subTitle: 'Fire & Safety Cell' },
    { id: 'fire_officer_minhas', title: 'Mr. Kuldeep Singh Minhas', category: 'Fire & Safety', numbers: ['9780036402'], subTitle: 'Fire Officer' },
    { id: 'fire_tender', title: 'Fire Tender (Emergency)', category: 'Fire & Safety', numbers: ['7508183870'], subTitle: 'Immediate Response' },
    { id: 'surinder_khurana_fire', title: 'Mr. Surinder Kumar Khurana', category: 'Fire & Safety', numbers: ['9876644331'], blocks: [{ label: 'Landline', number: '01824-444097' }], subTitle: 'Safety Cell' },
    { id: 'sunil_sharma_safety', title: 'Mr. Sunil Sharma', category: 'Fire & Safety', numbers: ['9878426874'], blocks: [{ label: 'Landline', number: '01824-444661' }], subTitle: 'Safety Cell' },
    { id: 'brig_dhillon', title: 'Brig. G. S. Dhillon', category: 'Fire & Safety', numbers: ['9780005945'], blocks: [{ label: 'Landline', number: '01824-444200' }], subTitle: 'Director Security' },

    // Accounts & Fee Queries (9 AM - 5 PM)
    { id: 'accounts_helpdesk', title: 'Accounts Help Desk', category: 'Accounts', numbers: [], blocks: [{ label: 'Landline', number: '01824-444337' }], description: 'Email: helpdesk.accounts@lpu.co.in' },
    { id: 'krishan_lal', title: 'Mr. Krishan Lal', category: 'Accounts', numbers: ['8054848002'], subTitle: 'Coordinator (Dept)', description: 'Email: krishan.lal@lpu.co.in' },
    { id: 'manohar_sharma', title: 'Mr. Manohar Sharma', category: 'Accounts', numbers: ['9876740040'], subTitle: 'Head of Division', description: 'Email: cgm.lovely@gmail.com' },

    // Division of Student Relationship (9 AM - 5 PM)
    { id: 'dsr_helpline', title: 'Parental / Student Helpline', category: 'Student Relations', numbers: ['7347000929', '8968667777'], blocks: [{ label: 'Landline', number: '01824-510311' }], description: 'Email: parents@lpu.co.in' },

    // Administrative & Student Relations (General)
    { id: 'dsw_main', title: 'DSW Office', subTitle: 'Student Welfare', category: 'Administrative', numbers: ['01824-444234'], description: 'Grievance & Welfare' },
    { id: 'rms_helpline', title: 'RMS Support', subTitle: 'Student Relation', category: 'Administrative', numbers: ['01824-444040'], description: 'Relationship Management' },
    { id: 'security_ctrl', title: 'Security HQ', subTitle: 'Control Room', category: 'Administrative', numbers: ['01824-444501'], description: '24/7 Campus Monitoring' },
    { id: 'admission_cell', title: 'Admissions', subTitle: 'Counseling', category: 'Administrative', numbers: ['01824-404404'], description: 'Programs & Guidance' },
    { id: 'accounts_desk', title: 'Accounts Desk', subTitle: 'Fee Help', category: 'Administrative', numbers: ['01824444337'] },
];

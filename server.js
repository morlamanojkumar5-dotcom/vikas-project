const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('.'));
app.use('/uploads', express.static('uploads'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// In-memory storage
let users = [];
let courses = [];
let assignments = [];
let attendance = [];
let grades = [];
let leaveRequests = [];
let mockTests = [];
let complaints = [];
let assignmentSubmissions = [];
let enrollments = [];
let forumPosts = [];
let notifications = [];
let timetables = [];
let chatMessages = [];
let events = [];
let liveSessions = [];
let questionPapers = [];
let leaderboards = [];
let studentCredits = [];
let conceptMaps = [];
let courseRecommendations = [];

// AI Chatbot responses
const chatbotResponses = {
  'book': 'You can find books in the library section. For specific book searches, please provide the book title or author name.',
  'assignment': 'Assignments are available in your dashboard. Submit them before the due date to avoid penalties.',
  'attendance': 'Your attendance is calculated based on the classes you attend. Minimum 75% attendance is required.',
  'result': 'Results are published at the end of each semester. Check your grade report for detailed performance.',
  'course': 'Courses are assigned based on your department and semester. Contact your department head for course changes.',
  'library': 'The library is open from 9 AM to 6 PM. You can borrow up to 3 books for 15 days.',
  'fee': 'Fee payment deadlines are mentioned in the academic calendar. Late payments may incur penalties.',
  'exam': 'Exam schedules are published in the academic calendar. Hall tickets will be available one week before exams.',
  'leave': 'You can request leave through the Leave section. Approved leaves will not affect your attendance.',
  'complaint': 'You can raise complaints through the Complaints section. They will be reviewed by the administration.',
  'forum': 'You can participate in course discussions through the Forum section. Share your questions and knowledge with others.',
  'enroll': 'You can enroll in available courses through the Courses section. Browse and join courses relevant to your department.',
  'timetable': 'You can view your class timetable in the Timetable section. It shows your daily/weekly schedule.',
  'event': 'You can view and participate in college events through the Events section. Check for upcoming fests and technical events.',
  'live': 'You can join live sessions through the Live Sessions section. Check the schedule and join using the provided links.',
  'question': 'You can download question papers from the Question Papers section. They are organized by course and year.',
  'holiday': 'You can check the holiday calendar to see upcoming holidays and breaks.',
  'leaderboard': 'The leaderboard shows top performing students each month. Earn credits by performing well in assignments and exams.',
  'credit': 'Credits are earned through academic performance and leaderboard rankings. They contribute to your overall academic standing.',
  'concept': 'Concept maps help visualize relationships between different topics in your courses. Check the Concept Map section.',
  'recommendation': 'Course recommendations are based on your performance and interests. They help you choose relevant courses.',
  'default': 'I\'m here to help you with academic queries. Please ask about books, assignments, attendance, results, courses, library, fees, exams, leave, complaints, forum, enrollment, timetable, events, live sessions, question papers, holidays, leaderboard, credits, concept maps, or course recommendations.'
};

// Indian Holidays 2024
const indianHolidays = [
  { date: '2024-01-26', name: 'Republic Day' },
  { date: '2024-03-08', name: 'Maha Shivaratri' },
  { date: '2024-03-25', name: 'Holi' },
  { date: '2024-04-09', name: 'Gudi Padwa' },
  { date: '2024-04-11', name: 'Ram Navami' },
  { date: '2024-04-17', name: 'Mahavir Jayanti' },
  { date: '2024-05-01', name: 'May Day' },
  { date: '2024-05-23', name: 'Buddha Purnima' },
  { date: '2024-08-15', name: 'Independence Day' },
  { date: '2024-08-19', name: 'Raksha Bandhan' },
  { date: '2024-09-02', name: 'Ganesh Chaturthi' },
  { date: '2024-10-02', name: 'Gandhi Jayanti' },
  { date: '2024-10-12', name: 'Dussehra' },
  { date: '2024-10-31', name: 'Diwali' },
  { date: '2024-11-15', name: 'Guru Nanak Jayanti' },
  { date: '2024-12-25', name: 'Christmas Day' }
];

// Socket.io for real-time notifications
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-user', (userEmail) => {
    socket.join(userEmail);
  });
  
  socket.on('join-chat', (data) => {
    socket.join(`chat-${data.parentEmail}-${data.teacherEmail}`);
  });
  
  socket.on('send-chat-message', (data) => {
    const chatId = `chat-${data.parentEmail}-${data.teacherEmail}`;
    const message = {
      id: uuidv4(),
      parentEmail: data.parentEmail,
      teacherEmail: data.teacherEmail,
      message: data.message,
      sender: data.sender,
      timestamp: new Date().toISOString()
    };
    
    chatMessages.push(message);
    io.to(chatId).emit('new-chat-message', message);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Helper function to send notifications
function sendNotification(userEmail, title, message, type = 'info') {
  const notification = {
    id: uuidv4(),
    userEmail,
    title,
    message,
    type,
    read: false,
    timestamp: new Date().toISOString()
  };
  
  notifications.push(notification);
  io.to(userEmail).emit('notification', notification);
}

// Enhanced AI Chatbot with Gemini-like responses
async function getAIResponse(message) {
  try {
    // For demo purposes, using a simple response system
    // In production, you would integrate with an actual AI API
    const lowerMessage = message.toLowerCase();
    
    let response = chatbotResponses.default;
    
    for (const [key, value] of Object.entries(chatbotResponses)) {
      if (lowerMessage.includes(key) && key !== 'default') {
        response = value;
        break;
      }
    }
    
    // Add some contextual responses
    if (lowerMessage.includes('python') || lowerMessage.includes('programming')) {
      response = 'Python is a great programming language for beginners. It has simple syntax and is widely used in data science, web development, and automation. Would you like specific help with Python concepts?';
    }
    
    if (lowerMessage.includes('math') || lowerMessage.includes('calculus')) {
      response = 'Mathematics requires practice and understanding of fundamental concepts. I can help explain mathematical concepts or direct you to relevant resources. What specific topic are you struggling with?';
    }
    
    if (lowerMessage.includes('deadline') || lowerMessage.includes('due date')) {
      response = 'Check the Assignments section for all due dates. It\'s important to submit assignments before deadlines to avoid penalties. Would you like me to help you find a specific assignment deadline?';
    }
    
    return response;
  } catch (error) {
    console.error('AI Response error:', error);
    return 'I apologize, but I\'m having trouble processing your request right now. Please try again later or contact your teacher for immediate assistance.';
  }
}

// Generate course recommendations based on student performance
function generateCourseRecommendations(studentEmail) {
  const student = users.find(u => u.email === studentEmail);
  if (!student) return [];
  
  const studentGrades = grades.filter(g => g.studentEmail === studentEmail);
  const studentEnrollments = enrollments.filter(e => e.studentEmail === studentEmail);
  
  // Get completed courses
  const completedCourses = studentEnrollments.map(enrollment => {
    const course = courses.find(c => c.id === enrollment.courseId);
    return course ? course.courseName : null;
  }).filter(Boolean);
  
  // Analyze performance in different subjects
  const subjectPerformance = {};
  studentGrades.forEach(grade => {
    if (!subjectPerformance[grade.course]) {
      subjectPerformance[grade.course] = { total: 0, count: 0 };
    }
    
    const gradePoints = {
      'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
    };
    
    subjectPerformance[grade.course].total += gradePoints[grade.grade] || 0;
    subjectPerformance[grade.course].count++;
  });
  
  // Calculate average performance per subject
  Object.keys(subjectPerformance).forEach(subject => {
    subjectPerformance[subject].average = 
      subjectPerformance[subject].total / subjectPerformance[subject].count;
  });
  
  // Generate recommendations based on performance
  const recommendations = [];
  
  // Recommend advanced courses in strong subjects
  Object.keys(subjectPerformance).forEach(subject => {
    if (subjectPerformance[subject].average >= 3.5) {
      const advancedCourses = courses.filter(course => 
        course.courseName.toLowerCase().includes('advanced') &&
        course.department === student.department &&
        !completedCourses.includes(course.courseName)
      );
      
      recommendations.push(...advancedCourses.slice(0, 2));
    }
  });
  
  // Recommend complementary courses
  const complementaryCourses = courses.filter(course => 
    course.department === student.department &&
    !completedCourses.includes(course.courseName) &&
    !recommendations.find(rec => rec.id === course.id)
  );
  
  recommendations.push(...complementaryCourses.slice(0, 3));
  
  // Remove duplicates
  const uniqueRecommendations = recommendations.filter((course, index, self) =>
    index === self.findIndex(c => c.id === course.id)
  );
  
  return uniqueRecommendations.slice(0, 5);
}

// Generate concept map data for a course
function generateConceptMap(courseId) {
  const course = courses.find(c => c.id === courseId);
  if (!course) return null;
  
  // Sample concept map structure
  // In a real implementation, this would be more sophisticated
  const conceptMap = {
    id: uuidv4(),
    courseId,
    courseName: course.courseName,
    concepts: [
      {
        id: 'concept-1',
        name: 'Introduction',
        description: 'Basic concepts and fundamentals',
        connections: ['concept-2', 'concept-3'],
        level: 1
      },
      {
        id: 'concept-2',
        name: 'Core Principles',
        description: 'Main principles and theories',
        connections: ['concept-4', 'concept-5'],
        level: 2
      },
      {
        id: 'concept-3',
        name: 'Applications',
        description: 'Practical applications and use cases',
        connections: ['concept-5', 'concept-6'],
        level: 2
      },
      {
        id: 'concept-4',
        name: 'Advanced Topics',
        description: 'Complex and specialized areas',
        connections: ['concept-6'],
        level: 3
      },
      {
        id: 'concept-5',
        name: 'Case Studies',
        description: 'Real-world examples and analysis',
        connections: ['concept-4'],
        level: 3
      },
      {
        id: 'concept-6',
        name: 'Future Trends',
        description: 'Emerging developments and research',
        connections: [],
        level: 4
      }
    ],
    generatedDate: new Date().toISOString()
  };
  
  return conceptMap;
}

// Routes

// User Registration with Photo Upload
app.post('/api/register', upload.single('photo'), (req, res) => {
  try {
    const { type, email, password, name, department, subject, fatherName, rollNumber, parentEmail, parentPassword } = req.body;
    
    if (users.find(user => user.email === email)) {
      return res.json({ success: false, message: 'User already exists' });
    }
    
    // Generate roll number if not provided for students
    let finalRollNumber = rollNumber;
    if (type === 'student' && !rollNumber) {
      const studentsInDept = users.filter(u => u.type === 'student' && u.department === department).length;
      finalRollNumber = `${department.substring(0, 3).toUpperCase()}${(studentsInDept + 1).toString().padStart(3, '0')}`;
    }
    
    const user = {
      id: uuidv4(),
      type,
      email,
      password,
      name,
      department,
      rollNumber: type === 'student' ? finalRollNumber : null,
      subject: type === 'teacher' ? subject : null,
      fatherName: type === 'student' ? fatherName : null,
      photo: req.file ? `/uploads/${req.file.filename}` : null,
      registrationDate: new Date().toISOString()
    };
    
    users.push(user);
    
    // Initialize student credits
    if (type === 'student') {
      studentCredits.push({
        id: uuidv4(),
        studentEmail: email,
        totalCredits: 0,
        monthlyCredits: [],
        updatedDate: new Date().toISOString()
      });
    }
    
    // Create parent account for student if provided
    if (type === 'student' && parentEmail && parentPassword) {
      const parent = {
        id: uuidv4(),
        type: 'parent',
        email: parentEmail,
        password: parentPassword,
        name: `${fatherName} (Parent)`,
        studentEmail: email,
        registrationDate: new Date().toISOString()
      };
      users.push(parent);
    }
    
    res.json({ success: true, message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.json({ success: false, message: 'Registration failed: ' + error.message });
  }
});

// User Login
app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Don't send password back
      const { password, ...userWithoutPassword } = user;
      res.json({ success: true, user: userWithoutPassword });
    } else {
      res.json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.json({ success: false, message: 'Login failed: ' + error.message });
  }
});

// Get User Profile
app.get('/api/profile/:email', (req, res) => {
  try {
    const user = users.find(u => u.email === req.params.email);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json({ success: true, user: userWithoutPassword });
    } else {
      res.json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.json({ success: false, message: 'Error fetching profile: ' + error.message });
  }
});

// Course Management
app.post('/api/courses', upload.array('files', 10), (req, res) => {
  try {
    const { teacherEmail, courseName, description, department, duration } = req.body;
    
    const course = {
      id: uuidv4(),
      teacherEmail,
      courseName,
      description,
      department,
      duration: duration || '1 semester',
      files: req.files ? req.files.map(file => ({
        name: file.originalname,
        url: `/uploads/${file.filename}`,
        uploadedDate: new Date().toISOString()
      })) : [],
      createdDate: new Date().toISOString()
    };
    
    courses.push(course);
    
    // Notify students in the same department
    const departmentStudents = users.filter(user => 
      user.type === 'student' && user.department === department
    );
    
    departmentStudents.forEach(student => {
      sendNotification(
        student.email,
        'New Course Available',
        `A new course "${courseName}" has been added to your department.`,
        'info'
      );
    });
    
    res.json({ success: true, message: 'Course created successfully' });
  } catch (error) {
    res.json({ success: false, message: 'Course creation failed: ' + error.message });
  }
});

app.get('/api/courses/:department', (req, res) => {
  try {
    const departmentCourses = courses.filter(course => course.department === req.params.department);
    res.json({ success: true, courses: departmentCourses });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching courses: ' + error.message });
  }
});

app.get('/api/all-courses', (req, res) => {
  try {
    res.json({ success: true, courses: courses });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching courses: ' + error.message });
  }
});

// Course Enrollment
app.post('/api/enroll', (req, res) => {
  try {
    const { studentEmail, courseId } = req.body;
    
    // Check if already enrolled
    const existingEnrollment = enrollments.find(enrollment => 
      enrollment.studentEmail === studentEmail && enrollment.courseId === courseId
    );
    
    if (existingEnrollment) {
      return res.json({ success: false, message: 'Already enrolled in this course' });
    }
    
    const enrollment = {
      id: uuidv4(),
      studentEmail,
      courseId,
      enrolledDate: new Date().toISOString()
    };
    
    enrollments.push(enrollment);
    
    // Notify teacher
    const course = courses.find(c => c.id === courseId);
    if (course) {
      sendNotification(
        course.teacherEmail,
        'New Student Enrollment',
        `A student has enrolled in your course "${course.courseName}".`,
        'info'
      );
    }
    
    res.json({ success: true, message: 'Enrolled successfully' });
  } catch (error) {
    res.json({ success: false, message: 'Enrollment failed: ' + error.message });
  }
});

app.get('/api/enrolled-courses/:studentEmail', (req, res) => {
  try {
    const studentEnrollments = enrollments.filter(enrollment => 
      enrollment.studentEmail === req.params.studentEmail
    );
    
    const enrolledCourses = studentEnrollments.map(enrollment => {
      const course = courses.find(c => c.id === enrollment.courseId);
      return course ? {
        ...course,
        enrolledDate: enrollment.enrolledDate
      } : null;
    }).filter(Boolean);
    
    res.json({ success: true, courses: enrolledCourses });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching enrolled courses: ' + error.message });
  }
});

app.get('/api/course-students/:courseId', (req, res) => {
  try {
    const courseEnrollments = enrollments.filter(enrollment => 
      enrollment.courseId === req.params.courseId
    );
    
    const students = courseEnrollments.map(enrollment => {
      const user = users.find(u => u.email === enrollment.studentEmail);
      return user ? { 
        name: user.name, 
        email: user.email,
        rollNumber: user.rollNumber,
        photo: user.photo,
        enrolledDate: enrollment.enrolledDate
      } : null;
    }).filter(Boolean);
    
    res.json({ success: true, students });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching course students: ' + error.message });
  }
});

// Attendance Management
app.post('/api/attendance', (req, res) => {
  try {
    const { teacherEmail, studentEmail, course, date, status } = req.body;
    
    // Check if attendance already exists for this student, course, and date
    const existingRecord = attendance.find(record => 
      record.studentEmail === studentEmail && 
      record.course === course && 
      record.date === date
    );
    
    if (existingRecord) {
      // Update existing record
      existingRecord.status = status;
      existingRecord.updatedDate = new Date().toISOString();
      res.json({ success: true, message: 'Attendance updated successfully' });
    } else {
      // Create new record
      const attendanceRecord = {
        id: uuidv4(),
        teacherEmail,
        studentEmail,
        course,
        date,
        status,
        recordedDate: new Date().toISOString()
      };
      attendance.push(attendanceRecord);
      res.json({ success: true, message: 'Attendance recorded successfully' });
    }
  } catch (error) {
    res.json({ success: false, message: 'Attendance recording failed: ' + error.message });
  }
});

app.get('/api/attendance/:studentEmail', (req, res) => {
  try {
    const studentAttendance = attendance.filter(record => record.studentEmail === req.params.studentEmail);
    res.json({ success: true, attendance: studentAttendance });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching attendance: ' + error.message });
  }
});

// Grade Management
app.post('/api/grades', (req, res) => {
  try {
    const { teacherEmail, studentEmail, course, grade, semester, assignmentId } = req.body;
    
    // Check if grade already exists for this student and course
    const existingGrade = grades.find(g => 
      g.studentEmail === studentEmail && 
      g.course === course && 
      g.semester === semester &&
      g.assignmentId === assignmentId
    );
    
    if (existingGrade) {
      // Update existing grade
      existingGrade.grade = grade;
      existingGrade.updatedDate = new Date().toISOString();
      res.json({ success: true, message: 'Grade updated successfully' });
      
      // Notify student
      sendNotification(
        studentEmail,
        'Grade Updated',
        `Your grade for ${course} has been updated to ${grade}.`,
        'info'
      );
    } else {
      // Create new grade
      const gradeRecord = {
        id: uuidv4(),
        teacherEmail,
        studentEmail,
        course,
        grade,
        semester,
        assignmentId,
        uploadedDate: new Date().toISOString()
      };
      grades.push(gradeRecord);
      res.json({ success: true, message: 'Grade uploaded successfully' });
      
      // Notify student
      sendNotification(
        studentEmail,
        'New Grade Available',
        `You have received a grade for ${course}: ${grade}.`,
        'info'
      );
    }
  } catch (error) {
    res.json({ success: false, message: 'Grade upload failed: ' + error.message });
  }
});

app.get('/api/grades/:studentEmail', (req, res) => {
  try {
    const studentGrades = grades.filter(grade => grade.studentEmail === req.params.studentEmail);
    res.json({ success: true, grades: studentGrades });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching grades: ' + error.message });
  }
});

// Assignment Management
app.post('/api/assignments', upload.array('files', 10), (req, res) => {
  try {
    const { teacherEmail, title, description, dueDate, course, department } = req.body;
    
    const assignment = {
      id: uuidv4(),
      teacherEmail,
      title,
      description,
      dueDate,
      course,
      department,
      files: req.files ? req.files.map(file => ({
        name: file.originalname,
        url: `/uploads/${file.filename}`,
        uploadedDate: new Date().toISOString()
      })) : [],
      createdDate: new Date().toISOString()
    };
    
    assignments.push(assignment);
    
    // Notify enrolled students
    const courseObj = courses.find(c => c.courseName === course);
    if (courseObj) {
      const courseEnrollments = enrollments.filter(enrollment => enrollment.courseId === courseObj.id);
      courseEnrollments.forEach(enrollment => {
        sendNotification(
          enrollment.studentEmail,
          'New Assignment',
          `A new assignment "${title}" has been posted for ${course}. Due date: ${dueDate}`,
          'warning'
        );
      });
    }
    
    res.json({ success: true, message: 'Assignment uploaded successfully' });
  } catch (error) {
    res.json({ success: false, message: 'Assignment upload failed: ' + error.message });
  }
});

app.get('/api/assignments/:department', (req, res) => {
  try {
    const departmentAssignments = assignments.filter(assignment => assignment.department === req.params.department);
    res.json({ success: true, assignments: departmentAssignments });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching assignments: ' + error.message });
  }
});

// Assignment Submission
app.post('/api/submit-assignment', upload.single('file'), (req, res) => {
  try {
    const { assignmentId, studentEmail } = req.body;
    
    const submission = {
      id: uuidv4(),
      assignmentId,
      studentEmail,
      file: req.file ? {
        name: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        uploadedDate: new Date().toISOString()
      } : null,
      submittedDate: new Date().toISOString(),
      status: 'submitted'
    };
    
    assignmentSubmissions.push(submission);
    
    // Notify teacher
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment) {
      sendNotification(
        assignment.teacherEmail,
        'Assignment Submitted',
        `A student has submitted the assignment "${assignment.title}".`,
        'info'
      );
    }
    
    res.json({ success: true, message: 'Assignment submitted successfully' });
  } catch (error) {
    res.json({ success: false, message: 'Assignment submission failed: ' + error.message });
  }
});

app.get('/api/assignment-submissions/:assignmentId', (req, res) => {
  try {
    const assignmentSubs = assignmentSubmissions.filter(sub => sub.assignmentId === req.params.assignmentId);
    res.json({ success: true, submissions: assignmentSubs });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching assignment submissions: ' + error.message });
  }
});

// Forum Management
app.post('/api/forum-posts', (req, res) => {
  try {
    const { userEmail, courseId, title, content } = req.body;
    
    const post = {
      id: uuidv4(),
      userEmail,
      courseId,
      title,
      content,
      replies: [],
      createdDate: new Date().toISOString()
    };
    
    forumPosts.push(post);
    
    // Notify course participants
    const courseEnrollments = enrollments.filter(enrollment => enrollment.courseId === courseId);
    courseEnrollments.forEach(enrollment => {
      if (enrollment.studentEmail !== userEmail) {
        sendNotification(
          enrollment.studentEmail,
          'New Forum Post',
          `A new discussion has been started in your course forum: "${title}"`,
          'info'
        );
      }
    });
    
    res.json({ success: true, message: 'Post created successfully' });
  } catch (error) {
    res.json({ success: false, message: 'Forum post creation failed: ' + error.message });
  }
});

app.post('/api/forum-replies', (req, res) => {
  try {
    const { postId, userEmail, content } = req.body;
    
    const post = forumPosts.find(p => p.id === postId);
    if (post) {
      const reply = {
        id: uuidv4(),
        userEmail,
        content,
        createdDate: new Date().toISOString()
      };
      
      post.replies.push(reply);
      
      // Notify post author
      if (post.userEmail !== userEmail) {
        sendNotification(
          post.userEmail,
          'New Forum Reply',
          `Someone replied to your post: "${post.title}"`,
          'info'
        );
      }
      
      res.json({ success: true, message: 'Reply posted successfully' });
    } else {
      res.json({ success: false, message: 'Post not found' });
    }
  } catch (error) {
    res.json({ success: false, message: 'Forum reply failed: ' + error.message });
  }
});

app.get('/api/forum-posts/:courseId', (req, res) => {
  try {
    const coursePosts = forumPosts.filter(post => post.courseId === req.params.courseId);
    res.json({ success: true, posts: coursePosts });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching forum posts: ' + error.message });
  }
});

// Leave Management with Document Upload
app.post('/api/leave', upload.single('document'), (req, res) => {
  try {
    const { userEmail, type, startDate, endDate, reason } = req.body;
    
    const leaveRequest = {
      id: uuidv4(),
      userEmail,
      type,
      startDate,
      endDate,
      reason,
      document: req.file ? {
        name: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        uploadedDate: new Date().toISOString()
      } : null,
      status: 'pending',
      submittedDate: new Date().toISOString()
    };
    
    leaveRequests.push(leaveRequest);
    
    // Notify relevant teachers
    if (type === 'student') {
      const student = users.find(u => u.email === userEmail);
      if (student) {
        const departmentTeachers = users.filter(u => u.type === 'teacher' && u.department === student.department);
        departmentTeachers.forEach(teacher => {
          sendNotification(
            teacher.email,
            'New Leave Request',
            `A student has submitted a leave request with ${req.file ? 'supporting document' : 'no document'}.`,
            'info'
          );
        });
      }
    }
    
    res.json({ success: true, message: 'Leave request submitted successfully' });
  } catch (error) {
    res.json({ success: false, message: 'Leave request failed: ' + error.message });
  }
});

app.get('/api/leave-requests/:department', (req, res) => {
  try {
    const departmentStudents = users.filter(user => 
      user.type === 'student' && user.department === req.params.department
    ).map(student => student.email);
    
    const departmentLeaveRequests = leaveRequests.filter(request => 
      departmentStudents.includes(request.userEmail) && request.status === 'pending'
    );
    
    res.json({ success: true, leaveRequests: departmentLeaveRequests });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching leave requests: ' + error.message });
  }
});

app.post('/api/leave-status', (req, res) => {
  try {
    const { leaveId, status } = req.body;
    
    const leaveRequest = leaveRequests.find(request => request.id === leaveId);
    if (leaveRequest) {
      leaveRequest.status = status;
      leaveRequest.processedDate = new Date().toISOString();
      
      // Notify student
      sendNotification(
        leaveRequest.userEmail,
        'Leave Request Update',
        `Your leave request has been ${status}.`,
        status === 'approved' ? 'success' : 'warning'
      );
      
      res.json({ success: true, message: 'Leave request updated successfully' });
    } else {
      res.json({ success: false, message: 'Leave request not found' });
    }
  } catch (error) {
    res.json({ success: false, message: 'Leave status update failed: ' + error.message });
  }
});

// Complaint Management
app.post('/api/complaint', (req, res) => {
  try {
    const { studentEmail, title, description, category } = req.body;
    
    const complaint = {
      id: uuidv4(),
      studentEmail,
      title,
      description,
      category,
      status: 'open',
      submittedDate: new Date().toISOString()
    };
    
    complaints.push(complaint);
    
    // Notify department teachers
    const student = users.find(u => u.email === studentEmail);
    if (student) {
      const departmentTeachers = users.filter(u => u.type === 'teacher' && u.department === student.department);
      departmentTeachers.forEach(teacher => {
        sendNotification(
          teacher.email,
          'New Complaint',
          `A new complaint has been submitted in your department.`,
          'warning'
        );
      });
    }
    
    res.json({ success: true, message: 'Complaint submitted successfully' });
  } catch (error) {
    res.json({ success: false, message: 'Complaint submission failed: ' + error.message });
  }
});

app.get('/api/complaints/:department', (req, res) => {
  try {
    const departmentStudents = users.filter(user => 
      user.type === 'student' && user.department === req.params.department
    ).map(student => student.email);
    
    const departmentComplaints = complaints.filter(complaint => 
      departmentStudents.includes(complaint.studentEmail)
    );
    
    res.json({ success: true, complaints: departmentComplaints });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching complaints: ' + error.message });
  }
});

app.post('/api/complaint-status', (req, res) => {
  try {
    const { complaintId, status } = req.body;
    
    const complaint = complaints.find(c => c.id === complaintId);
    if (complaint) {
      complaint.status = status;
      complaint.updatedDate = new Date().toISOString();
      
      // Notify student
      sendNotification(
        complaint.studentEmail,
        'Complaint Status Update',
        `Your complaint status has been updated to ${status}.`,
        'info'
      );
      
      res.json({ success: true, message: 'Complaint status updated successfully' });
    } else {
      res.json({ success: false, message: 'Complaint not found' });
    }
  } catch (error) {
    res.json({ success: false, message: 'Complaint status update failed: ' + error.message });
  }
});

// Student Management
app.get('/api/students/:department', (req, res) => {
  try {
    const departmentStudents = users.filter(user => 
      user.type === 'student' && user.department === req.params.department
    );
    
    // Remove passwords from response
    const studentsWithoutPasswords = departmentStudents.map(student => {
      const { password, ...studentWithoutPassword } = student;
      return studentWithoutPassword;
    });
    
    res.json({ success: true, students: studentsWithoutPasswords });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching students: ' + error.message });
  }
});

// Notification Management
app.get('/api/notifications/:userEmail', (req, res) => {
  try {
    const userNotifications = notifications
      .filter(notification => notification.userEmail === req.params.userEmail)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({ success: true, notifications: userNotifications });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching notifications: ' + error.message });
  }
});

app.post('/api/notifications/mark-read', (req, res) => {
  try {
    const { notificationId } = req.body;
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.read = true;
      res.json({ success: true, message: 'Notification marked as read' });
    } else {
      res.json({ success: false, message: 'Notification not found' });
    }
  } catch (error) {
    res.json({ success: false, message: 'Error marking notification as read: ' + error.message });
  }
});

// Timetable Management
app.post('/api/timetable', upload.single('timetableImage'), (req, res) => {
  try {
    const { teacherEmail, department, description } = req.body;
    
    const timetable = {
      id: uuidv4(),
      teacherEmail,
      department,
      description,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      uploadedDate: new Date().toISOString()
    };
    
    timetables.push(timetable);
    
    // Notify students in the department
    const departmentStudents = users.filter(user => 
      user.type === 'student' && user.department === department
    );
    
    departmentStudents.forEach(student => {
      sendNotification(
        student.email,
        'New Timetable Available',
        `A new timetable has been uploaded for your department.`,
        'info'
      );
    });
    
    res.json({ success: true, message: 'Timetable uploaded successfully' });
  } catch (error) {
    res.json({ success: false, message: 'Timetable upload failed: ' + error.message });
  }
});

app.get('/api/timetable/:department', (req, res) => {
  try {
    const departmentTimetable = timetables
      .filter(timetable => timetable.department === req.params.department)
      .sort((a, b) => new Date(b.uploadedDate) - new Date(a.uploadedDate))[0];
    
    res.json({ success: true, timetable: departmentTimetable });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching timetable: ' + error.message });
  }
});

// Events Management
app.post('/api/events', upload.array('files', 10), (req, res) => {
  try {
    const { teacherEmail, title, description, date, type, registrationLink } = req.body;
    
    const event = {
      id: uuidv4(),
      teacherEmail,
      title,
      description,
      date,
      type,
      registrationLink,
      files: req.files ? req.files.map(file => ({
        name: file.originalname,
        url: `/uploads/${file.filename}`,
        uploadedDate: new Date().toISOString()
      })) : [],
      createdDate: new Date().toISOString()
    };
    
    events.push(event);
    
    // Notify all students
    const allStudents = users.filter(user => user.type === 'student');
    allStudents.forEach(student => {
      sendNotification(
        student.email,
        'New Event Announcement',
        `A new ${type} event "${title}" has been announced. Check the Events section for details.`,
        'info'
      );
    });
    
    res.json({ success: true, message: 'Event created successfully' });
  } catch (error) {
    res.json({ success: false, message: 'Event creation failed: ' + error.message });
  }
});

app.get('/api/events', (req, res) => {
  try {
    // Sort events by date (most recent first)
    const sortedEvents = events.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ success: true, events: sortedEvents });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching events: ' + error.message });
  }
});

app.delete('/api/events/:eventId', (req, res) => {
  try {
    const eventIndex = events.findIndex(event => event.id === req.params.eventId);
    
    if (eventIndex !== -1) {
      events.splice(eventIndex, 1);
      res.json({ success: true, message: 'Event deleted successfully' });
    } else {
      res.json({ success: false, message: 'Event not found' });
    }
  } catch (error) {
    res.json({ success: false, message: 'Event deletion failed: ' + error.message });
  }
});

// Live Sessions Management
app.post('/api/live-sessions', (req, res) => {
  try {
    const { teacherEmail, title, description, dateTime, duration, course, link } = req.body;
    
    const liveSession = {
      id: uuidv4(),
      teacherEmail,
      title,
      description,
      dateTime,
      duration,
      course,
      link,
      createdDate: new Date().toISOString()
    };
    
    liveSessions.push(liveSession);
    
    // Notify enrolled students
    const courseObj = courses.find(c => c.courseName === course);
    if (courseObj) {
      const courseEnrollments = enrollments.filter(enrollment => enrollment.courseId === courseObj.id);
      courseEnrollments.forEach(enrollment => {
        sendNotification(
          enrollment.studentEmail,
          'New Live Session',
          `A new live session "${title}" has been scheduled for ${course}.`,
          'info'
        );
      });
    }
    
    res.json({ success: true, message: 'Live session created successfully' });
  } catch (error) {
    res.json({ success: false, message: 'Live session creation failed: ' + error.message });
  }
});

app.get('/api/live-sessions', (req, res) => {
  try {
    // Sort live sessions by date (most recent first)
    const sortedLiveSessions = liveSessions.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    res.json({ success: true, liveSessions: sortedLiveSessions });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching live sessions: ' + error.message });
  }
});

app.delete('/api/live-sessions/:sessionId', (req, res) => {
  try {
    const sessionIndex = liveSessions.findIndex(session => session.id === req.params.sessionId);
    
    if (sessionIndex !== -1) {
      liveSessions.splice(sessionIndex, 1);
      res.json({ success: true, message: 'Live session deleted successfully' });
    } else {
      res.json({ success: false, message: 'Live session not found' });
    }
  } catch (error) {
    res.json({ success: false, message: 'Live session deletion failed: ' + error.message });
  }
});

// Question Papers Management
app.post('/api/question-papers', upload.array('files', 10), (req, res) => {
  try {
    const { teacherEmail, title, description, course, year } = req.body;
    
    const questionPaper = {
      id: uuidv4(),
      teacherEmail,
      title,
      description,
      course,
      year,
      files: req.files ? req.files.map(file => ({
        name: file.originalname,
        url: `/uploads/${file.filename}`,
        uploadedDate: new Date().toISOString()
      })) : [],
      createdDate: new Date().toISOString()
    };
    
    questionPapers.push(questionPaper);
    
    // Notify students in the same department
    const teacher = users.find(u => u.email === teacherEmail);
    if (teacher) {
      const departmentStudents = users.filter(user => 
        user.type === 'student' && user.department === teacher.department
      );
      
      departmentStudents.forEach(student => {
        sendNotification(
          student.email,
          'New Question Paper',
          `A new question paper "${title}" has been uploaded for ${course}.`,
          'info'
        );
      });
    }
    
    res.json({ success: true, message: 'Question paper uploaded successfully' });
  } catch (error) {
    res.json({ success: false, message: 'Question paper upload failed: ' + error.message });
  }
});

app.get('/api/question-papers', (req, res) => {
  try {
    // Sort question papers by year (most recent first)
    const sortedQuestionPapers = questionPapers.sort((a, b) => b.year - a.year);
    res.json({ success: true, questionPapers: sortedQuestionPapers });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching question papers: ' + error.message });
  }
});

app.delete('/api/question-papers/:paperId', (req, res) => {
  try {
    const paperIndex = questionPapers.findIndex(paper => paper.id === req.params.paperId);
    
    if (paperIndex !== -1) {
      questionPapers.splice(paperIndex, 1);
      res.json({ success: true, message: 'Question paper deleted successfully' });
    } else {
      res.json({ success: false, message: 'Question paper not found' });
    }
  } catch (error) {
    res.json({ success: false, message: 'Question paper deletion failed: ' + error.message });
  }
});

// AI Chatbot
app.post('/api/chatbot', async (req, res) => {
  try {
    const { message, studentEmail } = req.body;
    
    const response = await getAIResponse(message);
    
    res.json({ success: true, response });
  } catch (error) {
    res.json({ success: false, message: 'Chatbot error: ' + error.message });
  }
});

// Mock Test Management
app.post('/api/mock-tests', (req, res) => {
  try {
    const { studentEmail, subject, questions, score, totalMarks } = req.body;
    
    const mockTest = {
      id: uuidv4(),
      studentEmail,
      subject,
      questions,
      score,
      totalMarks,
      submittedDate: new Date().toISOString()
    };
    
    mockTests.push(mockTest);
    
    // Award credits for mock test performance
    const performancePercentage = (score / totalMarks) * 100;
    let creditsEarned = 0;
    
    if (performancePercentage >= 90) creditsEarned = 50;
    else if (performancePercentage >= 80) creditsEarned = 40;
    else if (performancePercentage >= 70) creditsEarned = 30;
    else if (performancePercentage >= 60) creditsEarned = 20;
    else creditsEarned = 10;
    
    awardCredits(studentEmail, creditsEarned, 'Mock Test Performance');
    
    res.json({ success: true, message: 'Mock test submitted successfully' });
  } catch (error) {
    res.json({ success: false, message: 'Mock test submission failed: ' + error.message });
  }
});

app.get('/api/mock-tests/:studentEmail', (req, res) => {
  try {
    const studentMockTests = mockTests.filter(test => test.studentEmail === req.params.studentEmail);
    res.json({ success: true, mockTests: studentMockTests });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching mock tests: ' + error.message });
  }
});

// Performance Analytics
app.get('/api/performance/:studentEmail', (req, res) => {
  try {
    const studentEmail = req.params.studentEmail;
    
    // Get attendance data
    const studentAttendance = attendance.filter(record => record.studentEmail === studentEmail);
    
    // Get grades data
    const studentGrades = grades.filter(grade => grade.studentEmail === studentEmail);
    
    // Calculate attendance percentage by course
    const courseAttendance = {};
    studentAttendance.forEach(record => {
      if (!courseAttendance[record.course]) {
        courseAttendance[record.course] = { present: 0, total: 0 };
      }
      courseAttendance[record.course].total++;
      if (record.status === 'present') {
        courseAttendance[record.course].present++;
      }
    });
    
    // Calculate percentages
    Object.keys(courseAttendance).forEach(course => {
      const data = courseAttendance[course];
      data.percentage = (data.present / data.total) * 100;
    });
    
    res.json({
      success: true,
      attendance: courseAttendance,
      grades: studentGrades
    });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching performance data: ' + error.message });
  }
});

// Overall Grades
app.get('/api/overall-grades/:studentEmail', (req, res) => {
  try {
    const studentGrades = grades.filter(grade => grade.studentEmail === req.params.studentEmail);
    
    // Calculate overall grades by course
    const overallGrades = {};
    studentGrades.forEach(grade => {
      if (!overallGrades[grade.course]) {
        overallGrades[grade.course] = {
          grades: [],
          average: 0
        };
      }
      overallGrades[grade.course].grades.push(grade.grade);
    });
    
    // Calculate averages
    Object.keys(overallGrades).forEach(course => {
      const data = overallGrades[course];
      const gradePoints = {
        'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
      };
      
      let totalPoints = 0;
      data.grades.forEach(grade => {
        totalPoints += gradePoints[grade] || 0;
      });
      
      data.average = (totalPoints / data.grades.length).toFixed(2);
    });
    
    res.json({ success: true, overallGrades });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching overall grades: ' + error.message });
  }
});

// Parent-specific routes
app.get('/api/parent-student/:parentEmail', (req, res) => {
  try {
    const parent = users.find(u => u.email === req.params.parentEmail && u.type === 'parent');
    if (!parent) {
      return res.json({ success: false, message: 'Parent not found' });
    }
    
    const student = users.find(u => u.email === parent.studentEmail && u.type === 'student');
    if (!student) {
      return res.json({ success: false, message: 'Student not found' });
    }
    
    const { password, ...studentWithoutPassword } = student;
    res.json({ success: true, student: studentWithoutPassword });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching student data: ' + error.message });
  }
});

// Teacher-Parent Chat Management
app.get('/api/teachers/:department', (req, res) => {
  try {
    const departmentTeachers = users.filter(user => 
      user.type === 'teacher' && user.department === req.params.department
    );
    
    const teachersWithoutPasswords = departmentTeachers.map(teacher => {
      const { password, ...teacherWithoutPassword } = teacher;
      return teacherWithoutPassword;
    });
    
    res.json({ success: true, teachers: teachersWithoutPasswords });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching teachers: ' + error.message });
  }
});

app.get('/api/chat-messages/:parentEmail/:teacherEmail', (req, res) => {
  try {
    const messages = chatMessages.filter(msg => 
      (msg.parentEmail === req.params.parentEmail && msg.teacherEmail === req.params.teacherEmail) ||
      (msg.parentEmail === req.params.teacherEmail && msg.teacherEmail === req.params.parentEmail)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    res.json({ success: true, messages });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching chat messages: ' + error.message });
  }
});

// Leaderboard Management
app.post('/api/leaderboard', (req, res) => {
  try {
    const { teacherEmail, month, year, topStudents } = req.body;
    
    const leaderboard = {
      id: uuidv4(),
      teacherEmail,
      month,
      year,
      topStudents,
      createdDate: new Date().toISOString()
    };
    
    leaderboards.push(leaderboard);
    
    // Award credits to top students
    topStudents.forEach((student, index) => {
      let credits = 0;
      if (index === 0) credits = 100; // 1st place
      else if (index === 1) credits = 75; // 2nd place
      else if (index === 2) credits = 50; // 3rd place
      
      awardCredits(student.email, credits, `Leaderboard ${index + 1} Place - ${month}/${year}`);
      
      // Send notification to student
      sendNotification(
        student.email,
        'Leaderboard Achievement',
        `Congratulations! You ranked ${index + 1} in the ${month} ${year} leaderboard and earned ${credits} credits!`,
        'success'
      );
    });
    
    // Notify all students about new leaderboard
    const allStudents = users.filter(user => user.type === 'student');
    allStudents.forEach(student => {
      if (!topStudents.find(s => s.email === student.email)) {
        sendNotification(
          student.email,
          'New Leaderboard Published',
          `The ${month} ${year} leaderboard has been published. Check it out!`,
          'info'
        );
      }
    });
    
    res.json({ success: true, message: 'Leaderboard created successfully' });
  } catch (error) {
    res.json({ success: false, message: 'Leaderboard creation failed: ' + error.message });
  }
});

app.get('/api/leaderboard/:month/:year', (req, res) => {
  try {
    const { month, year } = req.params;
    const leaderboard = leaderboards.find(lb => 
      lb.month === month && lb.year.toString() === year
    );
    
    if (leaderboard) {
      res.json({ success: true, leaderboard });
    } else {
      res.json({ success: false, message: 'Leaderboard not found for this period' });
    }
  } catch (error) {
    res.json({ success: false, message: 'Error fetching leaderboard: ' + error.message });
  }
});

app.get('/api/leaderboards', (req, res) => {
  try {
    // Sort leaderboards by date (most recent first)
    const sortedLeaderboards = leaderboards.sort((a, b) => {
      const dateA = new Date(`${a.year}-${a.month}-01`);
      const dateB = new Date(`${b.year}-${b.month}-01`);
      return dateB - dateA;
    });
    
    res.json({ success: true, leaderboards: sortedLeaderboards });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching leaderboards: ' + error.message });
  }
});

// Student Credits Management
function awardCredits(studentEmail, credits, reason) {
  let studentCredit = studentCredits.find(sc => sc.studentEmail === studentEmail);
  
  if (!studentCredit) {
    studentCredit = {
      id: uuidv4(),
      studentEmail,
      totalCredits: 0,
      monthlyCredits: [],
      updatedDate: new Date().toISOString()
    };
    studentCredits.push(studentCredit);
  }
  
  // Add to total credits
  studentCredit.totalCredits += credits;
  
  // Add to monthly credits
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  let monthlyCredit = studentCredit.monthlyCredits.find(mc => mc.month === currentMonth);
  
  if (!monthlyCredit) {
    monthlyCredit = {
      month: currentMonth,
      credits: 0,
      activities: []
    };
    studentCredit.monthlyCredits.push(monthlyCredit);
  }
  
  monthlyCredit.credits += credits;
  monthlyCredit.activities.push({
    date: new Date().toISOString(),
    credits,
    reason
  });
  
  studentCredit.updatedDate = new Date().toISOString();
}

app.get('/api/student-credits/:studentEmail', (req, res) => {
  try {
    const studentCredit = studentCredits.find(sc => sc.studentEmail === req.params.studentEmail);
    
    if (studentCredit) {
      res.json({ success: true, credits: studentCredit });
    } else {
      res.json({ success: true, credits: {
        studentEmail: req.params.studentEmail,
        totalCredits: 0,
        monthlyCredits: [],
        updatedDate: new Date().toISOString()
      }});
    }
  } catch (error) {
    res.json({ success: false, message: 'Error fetching student credits: ' + error.message });
  }
});

app.get('/api/top-students', (req, res) => {
  try {
    // Get top 10 students by total credits
    const topStudents = studentCredits
      .sort((a, b) => b.totalCredits - a.totalCredits)
      .slice(0, 10)
      .map(credit => {
        const student = users.find(u => u.email === credit.studentEmail);
        return {
          name: student ? student.name : 'Unknown',
          email: credit.studentEmail,
          rollNumber: student ? student.rollNumber : 'N/A',
          totalCredits: credit.totalCredits,
          department: student ? student.department : 'N/A'
        };
      });
    
    res.json({ success: true, topStudents });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching top students: ' + error.message });
  }
});

// Holiday Calendar
app.get('/api/holidays/:year?', (req, res) => {
  try {
    const year = req.params.year || new Date().getFullYear().toString();
    
    // Filter holidays for the requested year
    const yearHolidays = indianHolidays.filter(holiday => 
      holiday.date.startsWith(year)
    );
    
    res.json({ success: true, holidays: yearHolidays });
  } catch (error) {
    res.json({ success: false, message: 'Error fetching holidays: ' + error.message });
  }
});

// Course Recommendations
app.get('/api/course-recommendations/:studentEmail', (req, res) => {
  try {
    const recommendations = generateCourseRecommendations(req.params.studentEmail);
    res.json({ success: true, recommendations });
  } catch (error) {
    res.json({ success: false, message: 'Error generating course recommendations: ' + error.message });
  }
});

// Concept Maps
app.get('/api/concept-map/:courseId', (req, res) => {
  try {
    let conceptMap = conceptMaps.find(cm => cm.courseId === req.params.courseId);
    
    if (!conceptMap) {
      conceptMap = generateConceptMap(req.params.courseId);
      if (conceptMap) {
        conceptMaps.push(conceptMap);
      }
    }
    
    if (conceptMap) {
      res.json({ success: true, conceptMap });
    } else {
      res.json({ success: false, message: 'Concept map not available for this course' });
    }
  } catch (error) {
    res.json({ success: false, message: 'Error fetching concept map: ' + error.message });
  }
});

// Initialize with sample data
function initializeSampleData() {
  // Sample students
  if (users.length === 0) {
    users.push({
      id: uuidv4(),
      type: 'student',
      email: 'student1@example.com',
      password: 'password123',
      name: 'John Doe',
      department: 'computer_science',
      rollNumber: 'CS001',
      fatherName: 'Robert Doe',
      registrationDate: new Date().toISOString()
    });
    
    users.push({
      id: uuidv4(),
      type: 'student',
      email: 'student2@example.com',
      password: 'password123',
      name: 'Jane Smith',
      department: 'computer_science',
      rollNumber: 'CS002',
      fatherName: 'Michael Smith',
      registrationDate: new Date().toISOString()
    });
    
    // Sample teacher
    users.push({
      id: uuidv4(),
      type: 'teacher',
      email: 'teacher@example.com',
      password: 'password123',
      name: 'Dr. Sarah Johnson',
      department: 'computer_science',
      subject: 'Programming',
      registrationDate: new Date().toISOString()
    });
    
    // Sample parent accounts
    users.push({
      id: uuidv4(),
      type: 'parent',
      email: 'parent1@example.com',
      password: 'password123',
      name: 'Robert Doe (Parent)',
      studentEmail: 'student1@example.com',
      registrationDate: new Date().toISOString()
    });
    
    users.push({
      id: uuidv4(),
      type: 'parent',
      email: 'parent2@example.com',
      password: 'password123',
      name: 'Michael Smith (Parent)',
      studentEmail: 'student2@example.com',
      registrationDate: new Date().toISOString()
    });
    
    // Initialize student credits
    studentCredits.push({
      id: uuidv4(),
      studentEmail: 'student1@example.com',
      totalCredits: 150,
      monthlyCredits: [
        {
          month: '2024-10',
          credits: 150,
          activities: [
            { date: '2024-10-15', credits: 50, reason: 'Assignment Excellence' },
            { date: '2024-10-20', credits: 100, reason: 'Leaderboard 1st Place' }
          ]
        }
      ],
      updatedDate: new Date().toISOString()
    });
    
    studentCredits.push({
      id: uuidv4(),
      studentEmail: 'student2@example.com',
      totalCredits: 75,
      monthlyCredits: [
        {
          month: '2024-10',
          credits: 75,
          activities: [
            { date: '2024-10-18', credits: 75, reason: 'Leaderboard 2nd Place' }
          ]
        }
      ],
      updatedDate: new Date().toISOString()
    });
    
    // Sample courses
    const course1 = {
      id: uuidv4(),
      teacherEmail: 'teacher@example.com',
      courseName: 'Introduction to Programming',
      description: 'Learn the fundamentals of programming with Python',
      department: 'computer_science',
      duration: '1 semester',
      files: [],
      createdDate: new Date().toISOString()
    };
    courses.push(course1);
    
    const course2 = {
      id: uuidv4(),
      teacherEmail: 'teacher@example.com',
      courseName: 'Data Structures',
      description: 'Learn about arrays, linked lists, trees, and algorithms',
      department: 'computer_science',
      duration: '1 semester',
      files: [],
      createdDate: new Date().toISOString()
    };
    courses.push(course2);
    
    const course3 = {
      id: uuidv4(),
      teacherEmail: 'teacher@example.com',
      courseName: 'Advanced Python Programming',
      description: 'Deep dive into advanced Python concepts and frameworks',
      department: 'computer_science',
      duration: '1 semester',
      files: [],
      createdDate: new Date().toISOString()
    };
    courses.push(course3);
    
    // Sample enrollments
    enrollments.push({
      id: uuidv4(),
      studentEmail: 'student1@example.com',
      courseId: course1.id,
      enrolledDate: new Date().toISOString()
    });
    
    enrollments.push({
      id: uuidv4(),
      studentEmail: 'student2@example.com',
      courseId: course1.id,
      enrolledDate: new Date().toISOString()
    });
    
    enrollments.push({
      id: uuidv4(),
      studentEmail: 'student1@example.com',
      courseId: course2.id,
      enrolledDate: new Date().toISOString()
    });
    
    // Sample assignments
    assignments.push({
      id: uuidv4(),
      teacherEmail: 'teacher@example.com',
      title: 'Python Basics Assignment',
      description: 'Complete the exercises on variables, loops, and functions',
      dueDate: '2024-12-15',
      course: 'Introduction to Programming',
      department: 'computer_science',
      files: [],
      createdDate: new Date().toISOString()
    });
    
    // Sample attendance records
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    attendance.push({
      id: uuidv4(),
      teacherEmail: 'teacher@example.com',
      studentEmail: 'student1@example.com',
      course: 'Introduction to Programming',
      date: today,
      status: 'present',
      recordedDate: new Date().toISOString()
    });
    
    attendance.push({
      id: uuidv4(),
      teacherEmail: 'teacher@example.com',
      studentEmail: 'student2@example.com',
      course: 'Introduction to Programming',
      date: today,
      status: 'present',
      recordedDate: new Date().toISOString()
    });
    
    attendance.push({
      id: uuidv4(),
      teacherEmail: 'teacher@example.com',
      studentEmail: 'student1@example.com',
      course: 'Introduction to Programming',
      date: yesterday,
      status: 'present',
      recordedDate: new Date().toISOString()
    });
    
    attendance.push({
      id: uuidv4(),
      teacherEmail: 'teacher@example.com',
      studentEmail: 'student2@example.com',
      course: 'Introduction to Programming',
      date: yesterday,
      status: 'absent',
      recordedDate: new Date().toISOString()
    });
    
    // Sample grades
    grades.push({
      id: uuidv4(),
      teacherEmail: 'teacher@example.com',
      studentEmail: 'student1@example.com',
      course: 'Introduction to Programming',
      grade: 'A',
      semester: '2024-1',
      assignmentId: assignments[0].id,
      uploadedDate: new Date().toISOString()
    });
    
    grades.push({
      id: uuidv4(),
      teacherEmail: 'teacher@example.com',
      studentEmail: 'student2@example.com',
      course: 'Introduction to Programming',
      grade: 'B+',
      semester: '2024-1',
      assignmentId: assignments[0].id,
      uploadedDate: new Date().toISOString()
    });
    
    // Sample timetable
    timetables.push({
      id: uuidv4(),
      teacherEmail: 'teacher@example.com',
      department: 'computer_science',
      description: 'Fall 2024 Timetable',
      image: null,
      uploadedDate: new Date().toISOString()
    });
    
    // Sample events
    events.push({
      id: uuidv4(),
      teacherEmail: 'teacher@example.com',
      title: 'Annual Tech Fest 2024',
      description: 'Join us for the biggest technical festival of the year with coding competitions, workshops, and guest lectures.',
      date: '2024-11-15',
      type: 'fest',
      registrationLink: 'https://example.com/techfest-registration',
      files: [],
      createdDate: new Date().toISOString()
    });
    
    events.push({
      id: uuidv4(),
      teacherEmail: 'teacher@example.com',
      title: 'Machine Learning Workshop',
      description: 'Hands-on workshop on machine learning fundamentals and practical applications.',
      date: '2024-10-20',
      type: 'workshop',
      registrationLink: 'https://example.com/ml-workshop',
      files: [],
      createdDate: new Date().toISOString()
    });
    
    // Sample live sessions
    liveSessions.push({
      id: uuidv4(),
      teacherEmail: 'teacher@example.com',
      title: 'Python Programming Basics',
      description: 'Introduction to Python programming with hands-on examples',
      dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      duration: 60,
      course: 'Introduction to Programming',
      link: 'https://meet.google.com/abc-def-ghi',
      createdDate: new Date().toISOString()
    });
    
    // Sample question papers
    questionPapers.push({
      id: uuidv4(),
      teacherEmail: 'teacher@example.com',
      title: 'Final Examination 2023',
      description: 'Computer Science Final Examination Question Paper',
      course: 'Introduction to Programming',
      year: '2023',
      files: [{
        name: 'CS_Final_2023.pdf',
        url: '/uploads/sample.pdf',
        uploadedDate: new Date().toISOString()
      }],
      createdDate: new Date().toISOString()
    });
    
    // Sample leaderboard
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
    const currentYear = new Date().getFullYear();
    
    leaderboards.push({
      id: uuidv4(),
      teacherEmail: 'teacher@example.com',
      month: currentMonth,
      year: currentYear,
      topStudents: [
        { name: 'John Doe', email: 'student1@example.com', rollNumber: 'CS001', credits: 150 },
        { name: 'Jane Smith', email: 'student2@example.com', rollNumber: 'CS002', credits: 75 },
        { name: 'Alex Johnson', email: 'student3@example.com', rollNumber: 'CS003', credits: 50 }
      ],
      createdDate: new Date().toISOString()
    });
    
    console.log('Sample data initialized:');
    console.log('Student 1: student1@example.com / password123');
    console.log('Student 2: student2@example.com / password123');
    console.log('Teacher: teacher@example.com / password123');
    console.log('Parent 1: parent1@example.com / password123');
    console.log('Parent 2: parent2@example.com / password123');
  }
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the application at: http://localhost:${PORT}`);
  initializeSampleData();
});
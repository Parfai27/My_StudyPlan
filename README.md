# MyStudyPlan - Study Timetable & Productivity Dashboard

A modern, feature-rich study planning application built with vanilla HTML, CSS, and JavaScript. MyStudyPlan helps students manage their study tasks, visualize their weekly schedule, and track productivity metrics with a beautiful, responsive interface.

![MyStudyPlan Dashboard](https://img.shields.io/badge/Status-Ready-success)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

### 📋 Task Management
- **Add Study Tasks** with comprehensive details:
  - Subject name
  - Topic/description
  - Duration (in hours)
  - Priority level (High, Medium, Low)
  - Deadline date
- **Task Actions**:
  - Mark tasks as completed with visual feedback
  - Delete tasks
  - Priority-based color coding
  - Overdue task warnings

### 📊 Progress Dashboard
- **Real-time Statistics**:
  - Total tasks counter
  - Completed tasks counter
  - Pending tasks counter
  - Total study hours tracking
- **Visual Progress Bar** showing completion percentage
- **Recent Tasks** quick view

### 📅 Weekly Timetable
- Interactive weekly schedule grid
- Time slots from 6 AM to 10 PM
- Automatic task distribution based on deadlines
- Color-coded task visualization

### 💾 Data Persistence
- All data stored in browser's localStorage
- Automatic save on every action
- Data persists across browser sessions
- No backend required

### 🎨 Modern UI/UX
- **Glassmorphism** design with backdrop blur effects
- **Gradient colors** and smooth animations
- **Responsive layout** - works on desktop, tablet, and mobile
- **Dark theme** optimized for extended study sessions
- **Smooth transitions** and hover effects
- **Toast notifications** for user feedback

## 📁 Project Structure

```
MyStudyPlan/
├── index.html          # Main application file
├── css/
│   └── style.css       # Complete styling with modern design
├── js/
│   └── script.js       # All application logic
└── README.md           # This file
```

## 🚀 How to Run

### Method 1: Direct File Opening
1. Download or clone this project to your computer
2. Navigate to the project folder
3. Double-click `index.html` to open it in your default browser

### Method 2: Local Server (Recommended)
1. Open a terminal in the project directory
2. If you have Python installed:
   ```bash
   # Python 3
   python -m http.server 8000
   ```
   Or if you have Node.js:
   ```bash
   # Using npx
   npx serve
   ```
3. Open your browser and navigate to `http://localhost:8000`

### Method 3: VS Code Live Server
1. Open the project in Visual Studio Code
2. Install the "Live Server" extension
3. Right-click on `index.html` and select "Open with Live Server"

## 📖 How to Use

### Adding a Task
1. Click the **"Add Task"** button in the header
2. Fill in the task details:
   - **Subject**: e.g., "Mathematics"
   - **Topic**: e.g., "Calculus - Derivatives"
   - **Duration**: Study time in hours (e.g., 2.5)
   - **Priority**: High, Medium, or Low
   - **Deadline**: Target completion date
3. Click **"Save Task"**

### Managing Tasks
- **Complete a Task**: Click the circle icon to mark as complete
- **Delete a Task**: Click the trash icon to remove
- **View Tasks**: Switch between Dashboard, Tasks, and Timetable views using the sidebar

### Viewing Progress
- Check the **Dashboard** for overall statistics
- Monitor your completion percentage with the progress bar
- View recent tasks at a glance

### Weekly Timetable
- Navigate to the **Timetable** section
- See your tasks distributed across the week
- Tasks are automatically placed based on their deadlines

## 🛠️ Technology Stack

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with custom properties, flexbox, and grid
- **JavaScript (ES6+)**: Vanilla JS with class-based architecture
- **LocalStorage API**: Client-side data persistence
- **Google Fonts**: Inter and Poppins for beautiful typography

## 🎨 Design Features

- **Color Scheme**: Vibrant gradients with dark theme
- **Typography**: Google Fonts (Inter for UI, Poppins for headings)
- **Layout**: Responsive sidebar with main content area
- **Components**: Glassmorphism cards, smooth animations, hover effects
- **Responsive**: Mobile-first approach with breakpoints at 768px and 480px

## 🌟 Key Highlights

✅ **No Backend Required** - Runs entirely in the browser  
✅ **Zero Dependencies** - Pure HTML, CSS, and JavaScript  
✅ **Fully Responsive** - Works on all devices  
✅ **Modern Design** - Glassmorphism and gradient aesthetics  
✅ **Data Persistence** - LocalStorage keeps your tasks safe  
✅ **User Friendly** - Intuitive interface with toast notifications  
✅ **Performance** - Fast and lightweight  

## 📱 Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Opera

## 🔮 Future Enhancements (Optional)

- Drag-and-drop task reordering
- Task categories/subjects management
- Export tasks to CSV/PDF
- Study session timer
- Dark/Light theme toggle
- Task search and filtering
- Recurring tasks
- Study streak tracking

## 📄 License

This project is free to use for educational purposes.

## 👨‍💻 Author

Created as a study productivity tool for students.

---

**Happy Studying! 📚✨**

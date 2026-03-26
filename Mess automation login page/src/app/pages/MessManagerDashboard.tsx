import { useState, useEffect } from 'react';
import {
  Users,
  MessageSquare,
  ShoppingCart,
  Calendar,
  Menu as MenuIcon,
  BarChart3,
  FileText,
  CheckCircle,
  UserPlus
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { VotesSection } from '../components/VotesSection';
import { RebateRequests } from '../components/RebateRequests';
import { StudentsList } from '../components/StudentsList';
import { FeedbackSection } from '../components/FeedbackSection';
import { ExtraBuyingHistory } from '../components/ExtraBuyingHistory';
import { MenuManagement } from '../components/MenuManagement';
import { PollManagement } from '../components/PollManagement';
import { NewPersonRequests } from '../components/NewPersonRequests';

export default function ManagerDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'votes', label: 'View Votes', icon: CheckCircle },
    { id: 'rebate', label: 'Rebate Requests', icon: FileText },
    { id: 'newperson', label: 'New Person Requests', icon: UserPlus },
    { id: 'students', label: 'All Students', icon: Users },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'history', label: 'Extra Buying History', icon: ShoppingCart },
    { id: 'menu', label: 'Menu Management', icon: Calendar },
    { id: 'polls', label: 'Poll Management', icon: BarChart3 },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'votes':
        return <VotesSection />;
      case 'rebate':
        return <RebateRequests />;
      case 'newperson':
        return <NewPersonRequests />;
      case 'students':
        return <StudentsList />;
      case 'feedback':
        return <FeedbackSection />;
      case 'history':
        return <ExtraBuyingHistory />;
      case 'menu':
        return <MenuManagement />;
      case 'polls':
        return <PollManagement />;
      case 'dashboard':
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-black z-50 flex items-center px-6">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-3 ml-4">
          <div className="w-10 h-10 border-2 border-black flex items-center justify-center font-bold">
            IIT
          </div>
          <div>
            <h1 className="font-bold text-lg">Mess Management for Managers</h1>
            <p className="text-xs text-gray-600">IIT Kanpur</p>
          </div>
        </div>

        <div className="ml-auto text-sm">
          <p className="font-medium">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className="text-xs text-gray-600">{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
        </div>
      </header>

      <div className="pt-16 flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          menuItems={menuItems}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Main Content */}
        <main className={`flex-1 p-8 transition-all ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function DashboardOverview() {
  const [stats, setStats] = useState({
    totalStudents: '0',
    pendingRebates: '0',
    activePolls: '0',
    newPersonRequests: '0',
    todaysPrebookings: '0'
  });

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalStudents: String(data.totalStudents || 0),
          pendingRebates: String(data.pendingRebates || 0),
          activePolls: String(data.activePolls || 0),
          newPersonRequests: String(data.newPersonRequests || 0),
          todaysPrebookings: String(data.todaysPrebookings || 0)
        });
      }
    } catch { /* */ }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statsList = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users },
    { label: 'Pending Rebates', value: stats.pendingRebates, icon: FileText },
    { label: 'Today\'s Pre-bookings', value: stats.todaysPrebookings, icon: ShoppingCart },
    { label: 'New Requests', value: stats.newPersonRequests, icon: UserPlus },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsList.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="border-2 border-black p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <Icon className="w-12 h-12 text-gray-400" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-2 border-black p-6">
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="border-2 border-black p-4 hover:bg-black hover:text-white transition-colors">
            Update Daily Menu
          </button>
          <button className="border-2 border-black p-4 hover:bg-black hover:text-white transition-colors">
            Create New Poll
          </button>
          <button className="border-2 border-black p-4 hover:bg-black hover:text-white transition-colors">
            View Feedback
          </button>
        </div>
      </div>

      <div className="border-2 border-black p-6">
        <h3 className="text-lg font-bold mb-4">Recent Activities</h3>
        <div className="space-y-3">
          {[
            { time: '1 min ago', text: 'System stats synchronized' },
            { time: '10 mins ago', text: 'New rebate request from Student #2301' },
            { time: '25 mins ago', text: 'Poll "Menu Preferences" ended' },
            { time: '1 hour ago', text: 'Menu updated for tomorrow' },
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-4 pb-3 border-b border-gray-200 last:border-0">
              <span className="text-xs text-gray-500 w-24">{activity.time}</span>
              <span className="text-sm">{activity.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
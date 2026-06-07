import { Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Dashboard from '../pages/Dashboard';
import Habits from '../pages/Habits';
import Landing from '../pages/Landing';
import LifeRules from '../pages/LifeRules';
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';
import PlanningDay from '../pages/PlanningDay';
import Register from '../pages/Register';
import Review from '../pages/Review';
import Rundown from '../pages/Rundown';
import SettingRundown from '../pages/SettingRundown';
import ProtectedRoute from './ProtectedRoute';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rundown" element={<Rundown />} />
          <Route path="/rundown/:date" element={<PlanningDay />} />
          <Route path="/setting-rundown" element={<SettingRundown />} />
          <Route path="/life-rules" element={<LifeRules />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/review" element={<Review />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

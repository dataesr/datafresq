import ChangePassword from './components/ChangePassword';
import ManageSessions from './components/ManageSessions';

export default function SecuritySettings() {
  return (
    <div className="settings-card-list">
      <ChangePassword />
      <ManageSessions />
    </div>
  );
}

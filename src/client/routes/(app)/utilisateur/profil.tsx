import SelectTheme from './components/SelectTheme';
import UpdateProfile from './components/UpdateProfile';

export default function ProfileSettings() {
  return (
    <div className="settings-card-list">
      <UpdateProfile />
      <SelectTheme />
    </div>
  );
}

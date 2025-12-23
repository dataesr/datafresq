import DeleteAccount from './components/DeleteAccount';
import DownloadUserData from './components/DownloadUserData';

export default function AccountSettings() {
  return (
    <div className="settings-card-list">
      <DownloadUserData />
      <DeleteAccount />
    </div>
  );
}

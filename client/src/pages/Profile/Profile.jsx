import { useAuthStore } from '../../stores/authStore';

export default function Profile() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
      
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          User Information
        </h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
              {user?.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
              {user?.email}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white mt-1 capitalize">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>

          {user?.department && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Department</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                {user.department}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

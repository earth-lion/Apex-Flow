import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AppLayout title="Profile" subtitle="Manage your account settings">
            <Head title="Profile" />

            <div className="page-header">
                <div className="page-header-left">
                    <h2>Profile Settings</h2>
                    <p>Update your name, email and password</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
                <div className="card">
                    <div className="card-body">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <UpdatePasswordForm />
                    </div>
                </div>

                <div className="card" style={{ border: '1px solid rgba(239,68,68,.25)' }}>
                    <div className="card-body">
                        <DeleteUserForm />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

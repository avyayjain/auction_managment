import { useEffect, useState } from "react";
import api from "../api/api";

interface UserProfile {
  user_id: number;
  name: string;
  email_id: string;
  user_type: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchProfile = () => {
    api.get("/user/me")
        .then(response => {
          setProfile(response.data);
        })
        .catch(error => {
          console.error("Failed to fetch profile", error);
        });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!profile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p><strong>User ID:</strong> {profile.user_id}</p>
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Email:</strong> {profile.email_id}</p>
        <p><strong>User Type:</strong> {profile.user_type}</p>
      </div>
    </div>
  );
};

export default Profile;

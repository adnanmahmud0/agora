import axiosPrivate from "@/utils/axiosPrivate";

export interface ApiUser {
  _id: string;
  name: string;
  role: string;
  email: string;
  image?: string;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  pagination: {
    total: number;
    limit: number;
    page: number;
    totalPage: number;
  };
  data: { users: ApiUser[] };
}

export interface UserListItem {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
}

export const fetchUsers = async (): Promise<UserListItem[]> => {
  const res = await axiosPrivate.get<UsersResponse>("/user");
  const users = res.data.data.users || [];
  return users.map((u) => ({
    id: u._id,
    name: u.name,
    role: u.role,
    email: u.email,
    avatar: u.image || "",
  }));
};


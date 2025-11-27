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
  pagination?: {
    total: number;
    limit: number;
    page: number;
    totalPage: number;
  };
  data: { users: ApiUser[] } | ApiUser[];
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
  const raw = res.data.data as { users: ApiUser[] } | ApiUser[];
  const list: ApiUser[] = Array.isArray(raw) ? raw : raw?.users || [];

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const normalizeAvatar = (url?: string): string => {
    const v = (url || "").trim().replace(/`/g, "");
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    if (v.startsWith("/")) return `${baseUrl}${v}`;
    return v;
  };

  return list.map((u) => ({
    id: u._id,
    name: u.name,
    role: u.role,
    email: u.email,
    avatar: normalizeAvatar(u.image),
  }));
};

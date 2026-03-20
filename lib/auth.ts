export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'agent';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Simple auth storage (would connect to backend in production)
export const authStorage = {
  saveUser: (user: User) => {
    localStorage.setItem('auth_user', JSON.stringify(user));
  },

  getUser: (): User | null => {
    try {
      const user = localStorage.getItem('auth_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  saveSession: (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('auth_users') || '[]');
    const userExists = users.find((u: any) => u.email === email);
    if (!userExists) {
      users.push({
        id: `user_${Date.now()}`,
        email,
        password: btoa(password), // Basic encoding (NOT secure - for demo only)
        name: email.split('@')[0],
        role: 'agent',
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('auth_users', JSON.stringify(users));
    }
  },

  verifyCredentials: (email: string, password: string): User | null => {
    const users = JSON.parse(localStorage.getItem('auth_users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === btoa(password));
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem('auth_user');
  },
};

export const defaultUsers = [
  {
    id: 'user_admin',
    email: 'admin@plum.com',
    password: btoa('admin123'),
    name: 'Admin User',
    role: 'admin' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_manager',
    email: 'john@plum.com',
    password: btoa('john123'),
    name: 'John Carter',
    role: 'manager' as const,
    createdAt: new Date().toISOString(),
  },
];

// Initialize default users
export const initializeAuth = () => {
  const existing = localStorage.getItem('auth_users');
  if (!existing) {
    localStorage.setItem('auth_users', JSON.stringify(defaultUsers));
  }
};

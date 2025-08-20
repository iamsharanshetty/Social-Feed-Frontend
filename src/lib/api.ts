const API_BASE_URL = 'http://localhost:8080';

export interface User {
  id: number;
  username: string;
}

export interface Message {
  id: number;
  messageText: string;
  accountId: number;
  postedBy?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface CreateMessageRequest {
  messageText: string;
  accountId: number;
}

export interface UpdateMessageRequest {
  messageText: string;
}

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Account API
export const registerUser = async (userData: RegisterRequest): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new ApiError(`Registration failed: ${response.statusText}`, response.status);
  }

  return response.json();
};

export const loginUser = async (credentials: LoginRequest): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new ApiError(`Login failed: ${response.statusText}`, response.status);
  }

  return response.json();
};

// Message API
export const getAllMessages = async (): Promise<Message[]> => {
  const response = await fetch(`${API_BASE_URL}/messages`);

  if (!response.ok) {
    throw new ApiError(`Failed to fetch messages: ${response.statusText}`, response.status);
  }

  return response.json();
};

export const getMessageById = async (id: number): Promise<Message> => {
  const response = await fetch(`${API_BASE_URL}/messages/${id}`);

  if (!response.ok) {
    throw new ApiError(`Failed to fetch message: ${response.statusText}`, response.status);
  }

  return response.json();
};

export const createMessage = async (messageData: CreateMessageRequest): Promise<Message> => {
  const response = await fetch(`${API_BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messageData),
  });

  if (!response.ok) {
    throw new ApiError(`Failed to create message: ${response.statusText}`, response.status);
  }

  return response.json();
};

export const updateMessage = async (id: number, messageData: UpdateMessageRequest): Promise<Message> => {
  const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messageData),
  });

  if (!response.ok) {
    throw new ApiError(`Failed to update message: ${response.statusText}`, response.status);
  }

  return response.json();
};

export const deleteMessage = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new ApiError(`Failed to delete message: ${response.statusText}`, response.status);
  }
};
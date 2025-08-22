// Change this to match your Spring Boot backend URL
const API_BASE_URL = 'https://demo-deployment-latest-mt9h.onrender.com'; // Remove '/api' prefix

export interface User {
  id: number;
  username: string;
  accountId: number; // Make this required since backend always returns it
}

export interface Message {
  messageId: number; // Backend uses messageId, not id
  messageText: string;
  postedBy: number; // Backend uses postedBy, not accountId
  timePostedEpoch: number;
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
  postedBy: number; // Changed from accountId to postedBy
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
    if (response.status === 409) {
      throw new ApiError('Username already exists', 409);
    }
    const errorText = await response.text();
    throw new ApiError(`Registration failed: ${response.statusText}`, response.status);
  }

  const responseData = await response.json();
  console.log('Registration response:', responseData);
  
  // Backend returns: { accountId: number, username: string, password: string }
  return {
    id: responseData.accountId,
    username: responseData.username,
    accountId: responseData.accountId
  };
};

export const loginUser = async (credentials: LoginRequest): Promise<User> => {
  console.log('Attempting login to:', `${API_BASE_URL}/login`);
  console.log('Login credentials:', credentials);
  
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    console.log('Login response status:', response.status);

    if (!response.ok) {
      if (response.status === 401) {
        throw new ApiError('Invalid username or password', 401);
      }
      const errorText = await response.text();
      throw new ApiError(`Login failed: ${response.statusText}`, response.status);
    }

    // Backend should return JSON with user data
    const userData = await response.json();
    console.log('Login response data:', userData);
    
    // Backend returns: { accountId: number, username: string, password: string }
    const user: User = {
      id: userData.accountId,
      username: userData.username,
      accountId: userData.accountId
    };
    
    console.log('Login successful, formatted user:', user);
    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Message API
export const getAllMessages = async (): Promise<Message[]> => {
  const response = await fetch(`${API_BASE_URL}/messages`);

  if (!response.ok) {
    throw new ApiError(`Failed to fetch messages: ${response.statusText}`, response.status);
  }

  const messages = await response.json();
  console.log('Fetched messages:', messages);
  return messages;
};

export const getMessageById = async (id: number): Promise<Message | null> => {
  const response = await fetch(`${API_BASE_URL}/messages/${id}`);

  if (!response.ok) {
    throw new ApiError(`Failed to fetch message: ${response.statusText}`, response.status);
  }

  const message = await response.json();
  // Backend returns empty response if message not found
  return message || null;
};

export const createMessage = async (messageData: CreateMessageRequest): Promise<Message> => {
  console.log('Creating message with data:', messageData);
  
  // Backend expects: { messageText: string, postedBy: number }
  const payload = {
    messageText: messageData.messageText,
    postedBy: messageData.postedBy
  };
  
  console.log('Sending payload to backend:', payload);
  
  try {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Create message response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create message error response:', errorText);
      
      if (response.status === 400) {
        throw new ApiError('Invalid message data. Please check your message text and try again.', 400);
      }
      throw new ApiError(`Failed to create message: ${response.statusText}`, response.status);
    }

    const result = await response.json();
    console.log('Message creation successful:', result);
    return result;
  } catch (error) {
    console.error('Create message error:', error);
    throw error;
  }
};

export const updateMessage = async (id: number, messageData: UpdateMessageRequest): Promise<number> => {
  const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messageData),
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new ApiError('Invalid message text or message not found', 400);
    }
    throw new ApiError(`Failed to update message: ${response.statusText}`, response.status);
  }

  // Backend returns number of rows affected (1 if successful)
  return await response.json();
};

export const deleteMessage = async (id: number): Promise<number> => {
  const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new ApiError(`Failed to delete message: ${response.statusText}`, response.status);
  }

  // Backend returns number of rows affected (1 if deleted, 0 if not found)
  const result = await response.text();
  return result ? parseInt(result) : 0;
};

export const getMessagesByUser = async (accountId: number): Promise<Message[]> => {
  const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/messages`);

  if (!response.ok) {
    throw new ApiError(`Failed to fetch user messages: ${response.statusText}`, response.status);
  }

  return response.json();
};
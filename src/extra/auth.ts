let token: string | null = null;

export const setToken = (t: string) => {
  token = t;
};

export const getToken = () => token;

export const clearToken = () => {
  token = null;
};

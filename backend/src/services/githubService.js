const GITHUB_API = 'https://api.github.com';
const GITHUB_VERSION = '2022-11-28';

const githubRequest = async (path, { token, method = 'GET', body } = {}) => {
  const response = await fetch(`${GITHUB_API}${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': GITHUB_VERSION,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `GitHub respondió con ${response.status}`);
    error.status = response.status;
    error.github = data;
    error.rateLimitReset = response.headers.get('x-ratelimit-reset');
    throw error;
  }
  return data;
};

export const exchangeCode = async (code) => {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_REDIRECT_URI
    })
  });
  const data = await response.json();
  if (!response.ok || data.error || !data.access_token) {
    const error = new Error(data.error_description || 'No se pudo autorizar GitHub');
    error.status = 502;
    throw error;
  }
  return data.access_token;
};

export const getGithubUser = (token) => githubRequest('/user', { token });
export const getRepositories = (token, page = 1, perPage = 100) => githubRequest(`/user/repos?sort=updated&per_page=${Math.min(perPage, 100)}&page=${page}`, { token });
export const getOrganizations = (token) => githubRequest('/user/orgs?per_page=100', { token });
export const getRepository = (token, owner, repo) => githubRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, { token });

export const createRepository = (token, data) => {
  const path = data.organization
    ? `/orgs/${encodeURIComponent(data.organization)}/repos`
    : '/user/repos';
  const body = {
    name: data.name,
    description: data.description || undefined,
    private: Boolean(data.private),
    auto_init: Boolean(data.auto_init)
  };
  return githubRequest(path, { token, method: 'POST', body });
};

export const buildAuthorizationUrl = (state) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_REDIRECT_URI,
    scope: 'repo',
    state
  });
  return `https://github.com/login/oauth/authorize?${params}`;
};

export const mapGithubError = (error) => {
  if (error.status === 401) return Object.assign(new Error('La conexión con GitHub expiró o fue revocada.'), { status: 401 });
  if (error.status === 403) return Object.assign(new Error('GitHub rechazó la operación o alcanzó el límite de solicitudes.'), { status: 403 });
  if (error.status === 404) return Object.assign(new Error('El repositorio no existe o no tienes acceso a él.'), { status: 404 });
  if (error.status === 422) return Object.assign(new Error('GitHub rechazó los datos. El nombre puede estar duplicado.'), { status: 422 });
  return error;
};

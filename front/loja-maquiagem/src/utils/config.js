/**
 * Arquivo de configuração para a aplicação
 */

// Configurações da API
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8081',
  TIMEOUT: 10000, // Timeout em milissegundos
  HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

// Rotas de redirecionamento
export const ROUTES = {
  LOGIN: '/',
  DASHBOARD_ADMIN: '/dashboard',
  DASHBOARD_VENDEDOR: '/dashboard-vendedor',
};

// Tipos de usuário
export const USER_TYPES = {
  DIRETOR: 'diretor',
  ESTOQUISTA: 'estoquista',
  VENDEDOR: 'vendedor'
};

export default {
  API_CONFIG,
  ROUTES,
  USER_TYPES
};
import axios from 'axios';
import { API_CONFIG, ROUTES, USER_TYPES } from './config';

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Função utilitária para realizar requisições à API
 * @param {string} endpoint - Endpoint da API
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {object} data - Dados para enviar (opcional)
 * @param {object} headers - Cabeçalhos adicionais (opcional)
 * @returns {Promise} - Promise com o resultado da requisição
 */
export const fetchApi = async (endpoint, method = 'GET', data = null, headers = {}) => {
  try {
    const requestConfig = {
      method,
      url: `${API_BASE_URL}/${endpoint}`,
      headers: {
        ...API_CONFIG.HEADERS,
        ...headers
      },
      timeout: API_CONFIG.TIMEOUT,
      ...(data && { data })
    };

    const response = await axios(requestConfig);
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    // Se o erro for de resposta (como 404, 500, etc)
    if (error.response) {
      return {
        success: false,
        status: error.response.status,
        data: error.response.data,
        message: error.response.data?.message || `Erro ${error.response.status}`
      };
    }
    
    // Se for erro de requisição (sem resposta do servidor)
    if (error.request) {
      return {
        success: false,
        status: 0,
        message: 'Não foi possível conectar ao servidor. Verifique sua conexão.'
      };
    }
    
    // Erros genéricos
    return {
      success: false,
      status: 0,
      message: error.message || 'Ocorreu um erro na requisição.'
    };
  }
};

/**
 * Função específica para verificar o tipo de usuário pelo CPF
 * @param {string} cpf - CPF do usuário formatado
 * @returns {Promise} - Promise com o resultado da verificação
 */
export const verificarUsuario = async (cpf) => {
  // Verifica se o usuário é um diretor
  const responseDiretor = await fetchApi(`diretores/${cpf}`);
  if (responseDiretor.success && responseDiretor.status === 200) {
    return {
      success: true,
      tipo: USER_TYPES.DIRETOR,
      redirect: ROUTES.DASHBOARD_ADMIN
    };
  }
  
  // Verifica se o usuário é um estoquista
  const responseEstoquista = await fetchApi(`estoquistas/${cpf}`);
  if (responseEstoquista.success && responseEstoquista.status === 200) {
    return {
      success: true,
      tipo: USER_TYPES.ESTOQUISTA,
      redirect: ROUTES.DASHBOARD_VENDEDOR
    };
  }
  
  // Verifica se o usuário é um vendedor
  const responseVendedor = await fetchApi(`vendedores/${cpf}`);
  if (responseVendedor.success && responseVendedor.status === 200) {
    return {
      success: true,
      tipo: USER_TYPES.VENDEDOR,
      redirect: ROUTES.DASHBOARD_VENDEDOR
    };
  }
  
  // Se chegou aqui, nenhum usuário foi encontrado
  return {
    success: false,
    message: 'Login incorreto. CPF não encontrado em nenhum funcionário.'
  };
};

export default {
  fetchApi,
  verificarUsuario
};
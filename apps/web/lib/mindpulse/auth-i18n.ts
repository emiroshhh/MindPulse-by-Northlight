import type { LanguageCode } from './tools';

export type AuthCopy = {
  loginTitle: string;
  signupTitle: string;
  loginIntro: string;
  signupIntro: string;
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  login: string;
  signup: string;
  loginError: string;
  signupError: string;
  hasAccount: string;
  needsAccount: string;
  getStarted: string;
  languageLabel: string;
};

const AUTH_COPY: Record<LanguageCode, AuthCopy> = {
  en: {
    loginTitle: 'Welcome back',
    signupTitle: 'Create your account',
    loginIntro:
      'Log in to continue your dashboard, chat history, and Agent plans.',
    signupIntro:
      'Save your study history, AI chats, and Agent plans privately.',
    name: 'Name',
    namePlaceholder: 'Alex',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    password: 'Password',
    passwordPlaceholder: 'At least 10 characters',
    login: 'Log in',
    signup: 'Create your free account',
    loginError: 'Invalid email or password.',
    signupError: 'Could not create account. Please check your details.',
    hasAccount: 'Already have an account?',
    needsAccount: 'New to MindPulse?',
    getStarted: 'Get started',
    languageLabel: 'Language',
  },
  ru: {
    loginTitle: 'С возвращением',
    signupTitle: 'Создай аккаунт',
    loginIntro:
      'Войди, чтобы продолжить работу с панелью, историей чата и планами Агента.',
    signupIntro:
      'Сохраняй историю учёбы, чаты с ИИ и планы Агента в своём приватном аккаунте.',
    name: 'Имя',
    namePlaceholder: 'Алекс',
    email: 'Электронная почта',
    emailPlaceholder: 'pochta@example.com',
    password: 'Пароль',
    passwordPlaceholder: 'Не менее 10 символов',
    login: 'Войти',
    signup: 'Создать бесплатный аккаунт',
    loginError: 'Неверный адрес электронной почты или пароль.',
    signupError: 'Не удалось создать аккаунт. Проверь введённые данные.',
    hasAccount: 'Уже есть аккаунт?',
    needsAccount: 'Впервые в MindPulse?',
    getStarted: 'Начать',
    languageLabel: 'Язык',
  },
  kk: {
    loginTitle: 'Қайта келгеніңе қуаныштымыз',
    signupTitle: 'Аккаунт аш',
    loginIntro:
      'Панельді, чат тарихын және Агент жоспарларын жалғастыру үшін кір.',
    signupIntro:
      'Оқу тарихыңды, ЖИ чаттарын және Агент жоспарларын жеке аккаунтыңда сақта.',
    name: 'Аты',
    namePlaceholder: 'Алекс',
    email: 'Электрондық пошта',
    emailPlaceholder: 'at@example.com',
    password: 'Құпиясөз',
    passwordPlaceholder: 'Кемінде 10 таңба',
    login: 'Кіру',
    signup: 'Тегін аккаунт ашу',
    loginError: 'Электрондық пошта немесе құпиясөз қате.',
    signupError: 'Аккаунт ашылмады. Енгізілген деректерді тексер.',
    hasAccount: 'Аккаунтың бар ма?',
    needsAccount: 'MindPulse-ті алғаш рет қолданып тұрсың ба?',
    getStarted: 'Бастау',
    languageLabel: 'Тіл',
  },
  es: {
    loginTitle: 'Te damos la bienvenida',
    signupTitle: 'Crea tu cuenta',
    loginIntro:
      'Inicia sesión para continuar con tu panel, historial de chat y planes del Agente.',
    signupIntro:
      'Guarda de forma privada tu historial de estudio, chats con IA y planes del Agente.',
    name: 'Nombre',
    namePlaceholder: 'Alex',
    email: 'Correo electrónico',
    emailPlaceholder: 'tu@ejemplo.com',
    password: 'Contraseña',
    passwordPlaceholder: 'Al menos 10 caracteres',
    login: 'Iniciar sesión',
    signup: 'Crear cuenta gratuita',
    loginError: 'El correo o la contraseña no son válidos.',
    signupError: 'No pudimos crear la cuenta. Revisa los datos.',
    hasAccount: '¿Ya tienes una cuenta?',
    needsAccount: '¿Es tu primera vez en MindPulse?',
    getStarted: 'Empezar',
    languageLabel: 'Idioma',
  },
};

export function authCopyFor(language: LanguageCode): AuthCopy {
  return AUTH_COPY[language];
}

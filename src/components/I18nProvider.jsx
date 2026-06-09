import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const I18nContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key, vars) => key
});

const TRANSLATIONS = {
  en: {
    // App General
    app_title: 'AI Freedom Studios',
    presented_by: 'Presented by AI Freedom Studios',
    welcome_back: 'Welcome back',

    // Public Home
    pub_tagline: 'AI-Powered Business Platform',
    pub_hero_badge: 'All-in-One AI Business Automation Platform',
    pub_hero_title: 'AI Freedom Studios',
    pub_hero_sub: 'The complete AI-powered platform for creators, marketers, and agencies. Replace 10+ expensive SaaS tools with one unified system.',
    pub_hero_sub2: 'AI video creation, marketing automation, CRM, ad management, AI receptionist, workflow automation — all in one platform.',
    pub_get_started: 'Get Started',
    pub_sign_in: 'Sign In',
    pub_sign_in_dashboard: 'Sign In to Dashboard',
    pub_everything_title: 'Everything Your Business Needs',
    pub_everything_sub: 'AI Freedom Studios combines AI content creation, marketing automation, CRM, and analytics into one powerful platform.',
    pub_why_title: 'Why Choose AI Freedom Studios?',
    pub_pricing_title: 'Simple, All-Inclusive Pricing',
    pub_pricing_sub: 'Starting at $297/mo — vs. $593+/mo for separate tools.',
    pub_cta_title: 'Ready to Scale Your Business with AI?',
    pub_cta_sub: 'Join creators and agencies generating $10k–$50k/mo with AI Freedom Studios.',
    pub_get_access: 'Get Access Now',
    pub_start_trial: 'Start Free Trial →',
    pub_privacy: 'Privacy',
    pub_terms: 'Terms',
    pub_contact: 'Contact Support',
    pub_dev_guide: 'Developer Guide',
    pub_footer_copy: 'All rights reserved.',
    pub_popular: 'POPULAR',
    pub_core_tools: 'Core AI tools',
    pub_agency_clients: 'White-label + clients',
    pub_full_platform: 'Full platform',
    pub_custom: 'Custom',
    pub_select_lang: 'Language',

    pub_feat1_title: 'AI Video & Content Creation',
    pub_feat1_desc: 'Generate professional videos, images, scripts, and voice overs using 600+ AI models including Veo 3, Sora 2, and ElevenLabs.',
    pub_feat2_title: 'Marketing Automation',
    pub_feat2_desc: 'Email, SMS, and multi-channel campaigns with AI copywriting, funnel builder, lead magnets, and follow-up sequences.',
    pub_feat3_title: 'CRM & Lead Management',
    pub_feat3_desc: 'Unlimited contacts with AI lead scoring, pipeline management, conversion prediction, and GoHighLevel integration.',
    pub_feat4_title: 'AI Copilot & Automation',
    pub_feat4_desc: 'Conversational AI assistant with 50+ intents, workflow automation builder, and proactive next-best-action suggestions.',
    pub_feat5_title: 'AI Receptionist',
    pub_feat5_desc: '24/7 AI-powered phone agent that qualifies leads, books appointments, and provides call transcripts and analytics.',

    pub_ben1: 'Replace Synthesia, ClickFunnels, HubSpot, Jasper & more — in one platform',
    pub_ben2: '600+ AI models: GPT-4o, Claude, Gemini, Flux, Veo 3, ElevenLabs & more',
    pub_ben3: 'White-label agency solution — rebrand and resell to clients',
    pub_ben4: 'Built-in CRM with AI Freedom Studios — no GoHighLevel required',
    pub_ben5: 'AI receptionist handles calls 24/7 — never miss a lead',
    pub_ben6: 'Unlimited contacts, forms, campaigns, and automations',
    pub_ben7: 'SOC 2 Type II security, GDPR compliant, 2FA enabled',
    pub_ben8: '9 languages supported with AI-powered translation',
    
    // Navigation
    dashboard: 'Dashboard',
    agency_accelerator: 'Agency Accelerator',
    ai_copilot: 'AI Copilot',
    marketing_suite: 'Marketing Suite',
    video_studio: 'Video Studio',
    ctv_studio: 'CTV Studio',
    ai_art: 'AI Art',
    research: 'Research',
    social_media: 'Social Media',
    meta_ads: 'Meta Ads',
    analytics: 'Analytics',
    copilot_guide: 'Copilot Guide',
    settings: 'Settings',
    language: 'Language',
    
    // Marketing Suite
    offer_builder: 'Offer Builder',
    follow_up_builder: 'Follow-Up Builder',
    campaign_execution: 'Campaign Execution',
    funnel_analytics_nba: 'Funnel Analytics & NBA',
    budget_manager: 'Budget Manager',
    
    // Dashboard Stats
    total_projects: 'Total Projects',
    ai_renders: 'AI Renders',
    content_pieces: 'Content Pieces',
    revenue_generated: 'Revenue Generated',
    quick_start: 'Quick Start',
    agency_revenue_accelerator: 'Agency Revenue Accelerator',
    ai_marketing_suite: 'AI Marketing Suite',
    try_these_copilot_commands: 'Try These Copilot Commands',
    content_creation_tools: 'Content Creation Tools',
    advanced_features: 'Advanced Features',

    // Actions
    create: 'Create',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    export: 'Export',
    import: 'Import',
    upload: 'Upload',
    download: 'Download',
    share: 'Share',
    launch: 'Launch',
    pause: 'Pause',
    resume: 'Resume',
    analyze: 'Analyze',
    optimize: 'Optimize',
    generate: 'Generate',
    
    // Common
    loading: 'Loading...',
    saved: 'Saved successfully',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    select_language: 'Select your language',
    no_data: 'No data available',
    
    // Home Page
    hero_title: 'Why AI Freedom Studios Wins',
    hero_sub: 'From idea → content → distribution → optimization → revenue in under 40 minutes.',
    
    // Copilot
    ask_copilot: 'Ask AI Copilot anything...',
    copilot_ready: 'AI Copilot ready to help',
    
    // Intent Commands
    'intent.offer.score': 'Score my offer',
    'intent.followup.generate': 'Generate follow-up sequence',
    'intent.ads.launch': 'Launch ad campaign',
    'intent.analytics.nba': 'Analyze my campaigns',
    'intent.budget.optimize': 'Optimize my budget',
    'intent.video.create': 'Create a video',
    'intent.ctv.setup': 'Help me set up CTV',
    'intent.content.ideas': 'Give me content ideas',
    'intent.abtest.create': 'Create A/B test',
    
    // Messages
    'msg.no_campaigns': 'No active campaigns to analyze',
    'msg.create_first': 'Create your first {type} to get started',
    'msg.test_created': 'A/B Test created successfully',
    'msg.sequence_generated': 'Follow-up sequence generated',
    'msg.campaign_launched': 'Campaign launched successfully'
  },
  
  es: {
    // App General
    app_title: 'AI Freedom Studios',
    presented_by: 'Presentado por AI Freedom Studios',
    welcome_back: 'Bienvenido de nuevo',

    // Public Home
    pub_tagline: 'Plataforma Empresarial con IA',
    pub_hero_badge: 'Plataforma de Automatización Empresarial con IA Todo en Uno',
    pub_hero_title: 'AI Freedom Studios',
    pub_hero_sub: 'La plataforma de IA completa para creadores, marketers y agencias. Reemplaza más de 10 costosas herramientas SaaS con un sistema unificado.',
    pub_hero_sub2: 'Creación de video con IA, automatización de marketing, CRM, gestión de anuncios, recepcionista IA, automatización de flujos — todo en uno.',
    pub_get_started: 'Comenzar',
    pub_sign_in: 'Iniciar Sesión',
    pub_sign_in_dashboard: 'Iniciar Sesión en el Panel',
    pub_everything_title: 'Todo lo que tu Negocio Necesita',
    pub_everything_sub: 'AI Freedom Studios combina creación de contenido IA, automatización de marketing, CRM y analítica en una plataforma poderosa.',
    pub_why_title: '¿Por qué elegir AI Freedom Studios?',
    pub_pricing_title: 'Precios Simples y Todo Incluido',
    pub_pricing_sub: 'Desde $297/mes — vs. $593+/mes en herramientas separadas.',
    pub_cta_title: '¿Listo para escalar tu negocio con IA?',
    pub_cta_sub: 'Únete a creadores y agencias que generan $10k–$50k/mes con AI Freedom Studios.',
    pub_get_access: 'Obtener Acceso Ahora',
    pub_start_trial: 'Iniciar Prueba Gratuita →',
    pub_privacy: 'Privacidad',
    pub_terms: 'Términos',
    pub_contact: 'Soporte',
    pub_dev_guide: 'Guía Dev',
    pub_footer_copy: 'Todos los derechos reservados.',
    pub_popular: 'POPULAR',
    pub_core_tools: 'Herramientas IA básicas',
    pub_agency_clients: 'Marca blanca + clientes',
    pub_full_platform: 'Plataforma completa',
    pub_custom: 'Personalizado',
    pub_select_lang: 'Idioma',
    pub_feat1_title: 'Video e Contenido IA',
    pub_feat1_desc: 'Genera videos, imágenes, guiones y voces con más de 600 modelos de IA.',
    pub_feat2_title: 'Automatización de Marketing',
    pub_feat2_desc: 'Campañas de email, SMS y multicanal con copywriting IA, embudo y secuencias.',
    pub_feat3_title: 'CRM y Gestión de Leads',
    pub_feat3_desc: 'Contactos ilimitados con puntuación IA, gestión de pipeline y predicción de conversión.',
    pub_feat4_title: 'Copiloto IA y Automatización',
    pub_feat4_desc: 'Asistente IA conversacional con +50 intenciones y sugerencias de próxima mejor acción.',
    pub_feat5_title: 'Recepcionista IA',
    pub_feat5_desc: 'Agente telefónico IA 24/7 que califica leads, agenda citas y provee transcripciones.',
    pub_ben1: 'Reemplaza Synthesia, ClickFunnels, HubSpot, Jasper y más — en una sola plataforma',
    pub_ben2: '+600 modelos IA: GPT-4o, Claude, Gemini, Flux, Veo 3, ElevenLabs y más',
    pub_ben3: 'Solución de agencia white-label — rebranding y reventa a clientes',
    pub_ben4: 'CRM integrado — sin necesidad de GoHighLevel',
    pub_ben5: 'Recepcionista IA atiende llamadas 24/7 — nunca pierdas un lead',
    pub_ben6: 'Contactos, formularios, campañas y automatizaciones ilimitadas',
    pub_ben7: 'Seguridad SOC 2 Tipo II, GDPR conforme, 2FA activado',
    pub_ben8: '9 idiomas soportados con traducción potenciada por IA',
    
    // Navigation
    dashboard: 'Panel',
    agency_accelerator: 'Acelerador de Agencia',
    ai_copilot: 'Copiloto IA',
    marketing_suite: 'Suite de Marketing',
    video_studio: 'Estudio de Video',
    ctv_studio: 'Estudio CTV',
    ai_art: 'Arte IA',
    research: 'Investigación',
    social_media: 'Redes Sociales',
    meta_ads: 'Anuncios Meta',
    analytics: 'Analítica',
    copilot_guide: 'Guía del Copiloto',
    settings: 'Configuración',
    language: 'Idioma',
    
    // Marketing Suite
    offer_builder: 'Constructor de Ofertas',
    follow_up_builder: 'Constructor de Seguimiento',
    campaign_execution: 'Ejecución de Campañas',
    funnel_analytics_nba: 'Analítica de Embudo • NBA',
    budget_manager: 'Gestor de Presupuesto',
    
    // Actions
    create: 'Crear',
    save: 'Guardar',
    cancel: 'Eliminar',
    delete: 'Eliminar',
    edit: 'Editar',
    view: 'Ver',
    export: 'Exportar',
    import: 'Importar',
    upload: 'Subir',
    download: 'Descargar',
    share: 'Compartir',
    launch: 'Lanzar',
    pause: 'Pausar',
    resume: 'Reanudar',
    analyze: 'Analizar',
    optimize: 'Optimizar',
    generate: 'Generar',
    
    // Common
    loading: 'Cargando...',
    saved: 'Guardado exitosamente',
    error: 'Error',
    success: 'Éxito',
    warning: 'Advertencia',
    info: 'Información',
    select_language: 'Selecciona tu idioma',
    no_data: 'No hay datos disponibles',
    
    // Home Page
    hero_title: 'Por qué gana AI Freedom Studios',
    hero_sub: 'De la idea → contenido → distribución → optimización → ingresos en menos de 40 minutos.',
    
    // Copilot
    ask_copilot: 'Pregunta al Copiloto IA...',
    copilot_ready: 'Copiloto IA listo para ayudar',
    
    // Intent Commands
    'intent.offer.score': 'Califica mi oferta',
    'intent.followup.generate': 'Generar secuencia de seguimiento',
    'intent.ads.launch': 'Lanzar campaña publicitaria',
    'intent.analytics.nba': 'Analizar mis campañas',
    'intent.budget.optimize': 'Optimizar mi presupuesto',
    'intent.video.create': 'Crear un video',
    'intent.ctv.setup': 'Ayúdame a configurar CTV',
    'intent.content.ideas': 'Dame ideas de contenido',
    'intent.abtest.create': 'Crear prueba A/B',
    
    // Messages
    'msg.no_campaigns': 'No hay campañas activas para analizar',
    'msg.create_first': 'Crea tu primer {type} para comenzar',
    'msg.test_created': 'Prueba A/B creada exitosamente',
    'msg.sequence_generated': 'Secuencia de seguimiento generada',
    'msg.campaign_launched': 'Campaña lanzada exitosamente'
  },
  
  fr: {
    // App General
    app_title: 'AI Freedom Studios',
    presented_by: 'Présenté par AI Freedom Studios',
    welcome_back: 'Bon retour',

    // Public Home
    pub_tagline: 'Plateforme Entreprise Propulsée par IA',
    pub_hero_badge: 'Plateforme d\'Automatisation Commerciale IA Tout-en-Un',
    pub_hero_title: 'AI Freedom Studios',
    pub_hero_sub: 'La plateforme IA complète pour créateurs, marketeurs et agences. Remplacez 10+ outils SaaS coûteux par un système unifié.',
    pub_hero_sub2: 'Création vidéo IA, automatisation marketing, CRM, gestion des publicités, réceptionniste IA, automatisation des flux — tout en un.',
    pub_get_started: 'Commencer',
    pub_sign_in: 'Se Connecter',
    pub_sign_in_dashboard: 'Accéder au Tableau de Bord',
    pub_everything_title: 'Tout ce dont votre Entreprise a Besoin',
    pub_everything_sub: 'AI Freedom Studios combine création de contenu IA, automatisation marketing, CRM et analytique en une seule plateforme.',
    pub_why_title: 'Pourquoi choisir AI Freedom Studios ?',
    pub_pricing_title: 'Tarification Simple et Tout Compris',
    pub_pricing_sub: 'À partir de 297$/mois — contre 593$+/mois pour des outils séparés.',
    pub_cta_title: 'Prêt à Scaler votre Entreprise avec l\'IA ?',
    pub_cta_sub: 'Rejoignez des créateurs et agences générant 10k–50k$/mois avec AI Freedom Studios.',
    pub_get_access: 'Obtenir l\'Accès',
    pub_start_trial: 'Démarrer l\'Essai Gratuit →',
    pub_privacy: 'Confidentialité',
    pub_terms: 'Conditions',
    pub_contact: 'Support',
    pub_dev_guide: 'Guide Dev',
    pub_footer_copy: 'Tous droits réservés.',
    pub_popular: 'POPULAIRE',
    pub_core_tools: 'Outils IA essentiels',
    pub_agency_clients: 'Marque blanche + clients',
    pub_full_platform: 'Plateforme complète',
    pub_custom: 'Personnalisé',
    pub_select_lang: 'Langue',
    pub_feat1_title: 'Création Vidéo & Contenu IA',
    pub_feat1_desc: 'Générez des vidéos, images, scripts et voix professionnels avec 600+ modèles IA.',
    pub_feat2_title: 'Automatisation Marketing',
    pub_feat2_desc: 'Campagnes email, SMS et multicanales avec copywriting IA et séquences de relance.',
    pub_feat3_title: 'CRM & Gestion des Leads',
    pub_feat3_desc: 'Contacts illimités avec scoring IA, gestion de pipeline et prédiction de conversion.',
    pub_feat4_title: 'Copilote IA & Automatisation',
    pub_feat4_desc: 'Assistant IA conversationnel avec 50+ intentions et suggestions de prochaine meilleure action.',
    pub_feat5_title: 'Réceptionniste IA',
    pub_feat5_desc: 'Agent téléphonique IA 24/7 qui qualifie les leads, prend des rendez-vous et fournit des transcriptions.',
    pub_ben1: 'Remplacez Synthesia, ClickFunnels, HubSpot, Jasper & plus — en une seule plateforme',
    pub_ben2: '600+ modèles IA: GPT-4o, Claude, Gemini, Flux, Veo 3, ElevenLabs & plus',
    pub_ben3: 'Solution agence marque blanche — rebrandez et revendez à vos clients',
    pub_ben4: 'CRM intégré — sans GoHighLevel requis',
    pub_ben5: 'Réceptionniste IA disponible 24/7 — ne ratez jamais un lead',
    pub_ben6: 'Contacts, formulaires, campagnes et automatisations illimités',
    pub_ben7: 'Sécurité SOC 2 Type II, conforme RGPD, 2FA activé',
    pub_ben8: '9 langues supportées avec traduction alimentée par IA',
    
    // Navigation
    dashboard: 'Tableau de bord',
    agency_accelerator: 'Accélérateur d\'Agence',
    ai_copilot: 'Copilote IA',
    marketing_suite: 'Suite Marketing',
    video_studio: 'Studio Vidéo',
    ctv_studio: 'Studio CTV',
    ai_art: 'Art IA',
    research: 'Recherche',
    social_media: 'Médias Sociaux',
    meta_ads: 'Publicités Meta',
    analytics: 'Analytique',
    copilot_guide: 'Guide du Copilote',
    settings: 'Paramètres',
    language: 'Langue',
    
    // Marketing Suite
    offer_builder: 'Créateur d\'Offres',
    follow_up_builder: 'Créateur de Relance',
    campaign_execution: 'Exécution de Campagnes',
    funnel_analytics_nba: 'Analytique d\'Entonnoir • NBA',
    budget_manager: 'Gestionnaire de Budget',
    
    // Actions
    create: 'Créer',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    view: 'Voir',
    export: 'Exporter',
    import: 'Importer',
    upload: 'Télécharger',
    download: 'Télécharger',
    share: 'Partager',
    launch: 'Lancer',
    pause: 'Pause',
    resume: 'Reprendre',
    analyze: 'Analyser',
    optimize: 'Optimiser',
    generate: 'Générer',
    
    // Common
    loading: 'Chargement...',
    saved: 'Enregistré avec succès',
    error: 'Erreur',
    success: 'Succès',
    warning: 'Avertissement',
    info: 'Information',
    select_language: 'Choisissez votre langue',
    no_data: 'Aucune donnée disponible',
    
    // Home Page
    hero_title: 'Pourquoi AI Freedom Studios gagne',
    hero_sub: 'De l\'idée → contenu → distribution → optimisation → revenus en moins de 40 minutes.',
    
    // Copilot
    ask_copilot: 'Demandez au Copilote IA...',
    copilot_ready: 'Copilote IA prêt à aider',
    
    // Intent Commands
    'intent.offer.score': 'Noter mon offre',
    'intent.followup.generate': 'Générer une séquence de relance',
    'intent.ads.launch': 'Lancer une campagne publicitaire',
    'intent.analytics.nba': 'Analyser mes campagnes',
    'intent.budget.optimize': 'Optimiser mon budget',
    'intent.video.create': 'Créer une vidéo',
    'intent.ctv.setup': 'Aidez-moi à configurer CTV',
    'intent.content.ideas': 'Donnez-moi des idées de contenu',
    'intent.abtest.create': 'Créer un test A/B',
    
    // Messages
    'msg.no_campaigns': 'Aucune campagne active à analyser',
    'msg.create_first': 'Créez votre premier {type} pour commencer',
    'msg.test_created': 'Test A/B créé avec succès',
    'msg.sequence_generated': 'Séquence de relance générée',
    'msg.campaign_launched': 'Campagne lancée avec succès'
  },
  
  pt: {
    // App General
    app_title: 'AI Freedom Studios',
    presented_by: 'Apresentado por AI Freedom Studios',
    welcome_back: 'Bem-vindo de volta',

    // Public Home
    pub_tagline: 'Plataforma Empresarial com IA',
    pub_hero_badge: 'Plataforma de Automação Empresarial com IA Tudo-em-Um',
    pub_hero_title: 'AI Freedom Studios',
    pub_hero_sub: 'A plataforma de IA completa para criadores, marketeiros e agências. Substitua 10+ ferramentas SaaS caras por um sistema unificado.',
    pub_hero_sub2: 'Criação de vídeo com IA, automação de marketing, CRM, gestão de anúncios, recepcionista IA, automação de fluxos — tudo em um.',
    pub_get_started: 'Começar',
    pub_sign_in: 'Entrar',
    pub_sign_in_dashboard: 'Acessar o Painel',
    pub_everything_title: 'Tudo o que seu Negócio Precisa',
    pub_everything_sub: 'AI Freedom Studios combina criação de conteúdo IA, automação de marketing, CRM e análise em uma plataforma poderosa.',
    pub_why_title: 'Por que escolher AI Freedom Studios?',
    pub_pricing_title: 'Preços Simples e Tudo Incluído',
    pub_pricing_sub: 'A partir de $297/mês — vs. $593+/mês em ferramentas separadas.',
    pub_cta_title: 'Pronto para Escalar seu Negócio com IA?',
    pub_cta_sub: 'Junte-se a criadores e agências gerando $10k–$50k/mês com AI Freedom Studios.',
    pub_get_access: 'Obter Acesso Agora',
    pub_start_trial: 'Iniciar Teste Gratuito →',
    pub_privacy: 'Privacidade',
    pub_terms: 'Termos',
    pub_contact: 'Suporte',
    pub_dev_guide: 'Guia Dev',
    pub_footer_copy: 'Todos os direitos reservados.',
    pub_popular: 'POPULAR',
    pub_core_tools: 'Ferramentas IA básicas',
    pub_agency_clients: 'White-label + clientes',
    pub_full_platform: 'Plataforma completa',
    pub_custom: 'Personalizado',
    pub_select_lang: 'Idioma',
    pub_feat1_title: 'Vídeo e Conteúdo com IA',
    pub_feat1_desc: 'Gere vídeos, imagens, roteiros e vozes com +600 modelos de IA.',
    pub_feat2_title: 'Automação de Marketing',
    pub_feat2_desc: 'Campanhas de email, SMS e multicanais com copywriting IA e sequências de follow-up.',
    pub_feat3_title: 'CRM e Gestão de Leads',
    pub_feat3_desc: 'Contatos ilimitados com pontuação IA, gestão de pipeline e previsão de conversão.',
    pub_feat4_title: 'Copiloto IA e Automação',
    pub_feat4_desc: 'Assistente IA conversacional com +50 intenções e sugestões de próxima melhor ação.',
    pub_feat5_title: 'Recepcionista IA',
    pub_feat5_desc: 'Agente telefônico IA 24/7 que qualifica leads, agenda consultas e fornece transcrições.',
    pub_ben1: 'Substitua Synthesia, ClickFunnels, HubSpot, Jasper e mais — em uma plataforma',
    pub_ben2: '+600 modelos IA: GPT-4o, Claude, Gemini, Flux, Veo 3, ElevenLabs e mais',
    pub_ben3: 'Solução agência white-label — rebrand e revenda para clientes',
    pub_ben4: 'CRM integrado — sem necessidade de GoHighLevel',
    pub_ben5: 'Recepcionista IA atende chamadas 24/7 — nunca perca um lead',
    pub_ben6: 'Contatos, formulários, campanhas e automações ilimitados',
    pub_ben7: 'Segurança SOC 2 Tipo II, conforme LGPD/GDPR, 2FA ativado',
    pub_ben8: '9 idiomas suportados com tradução potencializada por IA',
    
    // Navigation
    dashboard: 'Painel',
    agency_accelerator: 'Acelerador de Agência',
    ai_copilot: 'Copiloto IA',
    marketing_suite: 'Suíte de Marketing',
    video_studio: 'Estúdio de Vídeo',
    ctv_studio: 'Estúdio CTV',
    ai_art: 'Arte IA',
    research: 'Pesquisa',
    social_media: 'Mídias Sociais',
    meta_ads: 'Anúncios Meta',
    analytics: 'Analítica',
    copilot_guide: 'Guia do Copiloto',
    settings: 'Configurações',
    language: 'Idioma',
    
    // Marketing Suite
    offer_builder: 'Construtor de Ofertas',
    follow_up_builder: 'Construtor de Follow-Up',
    campaign_execution: 'Execução de Campanhas',
    funnel_analytics_nba: 'Analítica de Funil • NBA',
    budget_manager: 'Gerenciador de Orçamento',
    
    // Actions
    create: 'Criar',
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    view: 'Visualizar',
    export: 'Exportar',
    import: 'Importar',
    upload: 'Enviar',
    download: 'Baixar',
    share: 'Compartilhar',
    launch: 'Lançar',
    pause: 'Pausar',
    resume: 'Retomar',
    analyze: 'Analisar',
    optimize: 'Otimizar',
    generate: 'Gerar',
    
    // Common
    loading: 'Carregando...',
    saved: 'Salvo com sucesso',
    error: 'Erro',
    success: 'Sucesso',
    warning: 'Aviso',
    info: 'Informação',
    select_language: 'Selecione seu idioma',
    no_data: 'Nenhum dado disponível',
    
    // Home Page
    hero_title: 'Por que o AI Freedom Studios vence',
    hero_sub: 'Da ideia → conteúdo → distribuição → otimização → receita em menos de 40 minutos.',
    
    // Copilot
    ask_copilot: 'Pergunte ao Copiloto IA...',
    copilot_ready: 'Copiloto IA pronto para ajudar',
    
    // Intent Commands
    'intent.offer.score': 'Avaliar minha oferta',
    'intent.followup.generate': 'Gerar sequência de follow-up',
    'intent.ads.launch': 'Lançar campanha publicitária',
    'intent.analytics.nba': 'Analizar minhas campanhas',
    'intent.budget.optimize': 'Otimizar meu orçamento',
    'intent.video.create': 'Criar um vídeo',
    'intent.ctv.setup': 'Me ajude a configurar CTV',
    'intent.content.ideas': 'Me dê ideias de conteúdo',
    'intent.abtest.create': 'Criar teste A/B',
    
    // Messages
    'msg.no_campaigns': 'Nenhuma campanha ativa para analisar',
    'msg.create_first': 'Crie seu primeiro {type} para começar',
    'msg.test_created': 'Teste A/B criado com sucesso',
    'msg.sequence_generated': 'Sequência de follow-up gerada',
    'msg.campaign_launched': 'Campanha lançada com sucesso'
  },
  
  de: {
    // App General
    app_title: 'AI Freedom Studios',
    presented_by: 'Präsentiert von AI Freedom Studios',
    welcome_back: 'Willkommen zurück',

    // Public Home
    pub_tagline: 'KI-gestützte Business-Plattform',
    pub_hero_badge: 'All-in-One KI Business-Automatisierungsplattform',
    pub_hero_title: 'AI Freedom Studios',
    pub_hero_sub: 'Die komplette KI-Plattform für Creators, Marketer und Agenturen. Ersetzen Sie 10+ teure SaaS-Tools durch ein einheitliches System.',
    pub_hero_sub2: 'KI-Videoerstellung, Marketingautomatisierung, CRM, Anzeigenverwaltung, KI-Rezeptionist — alles in einem.',
    pub_get_started: 'Loslegen',
    pub_sign_in: 'Anmelden',
    pub_sign_in_dashboard: 'Zum Dashboard',
    pub_everything_title: 'Alles, was Ihr Unternehmen braucht',
    pub_everything_sub: 'AI Freedom Studios kombiniert KI-Inhaltserstellung, Marketingautomatisierung, CRM und Analytik in einer leistungsstarken Plattform.',
    pub_why_title: 'Warum AI Freedom Studios wählen?',
    pub_pricing_title: 'Einfache Rundum-Preisgestaltung',
    pub_pricing_sub: 'Ab $297/Monat — vs. $593+/Monat für separate Tools.',
    pub_cta_title: 'Bereit, Ihr Business mit KI zu skalieren?',
    pub_cta_sub: 'Schließen Sie sich Creators und Agenturen an, die $10k–$50k/Monat mit AI Freedom Studios generieren.',
    pub_get_access: 'Jetzt Zugang erhalten',
    pub_start_trial: 'Kostenlose Testversion starten →',
    pub_privacy: 'Datenschutz',
    pub_terms: 'AGB',
    pub_contact: 'Support',
    pub_dev_guide: 'Entwicklerhandbuch',
    pub_footer_copy: 'Alle Rechte vorbehalten.',
    pub_popular: 'BELIEBT',
    pub_core_tools: 'Kern-KI-Tools',
    pub_agency_clients: 'White-Label + Kunden',
    pub_full_platform: 'Vollständige Plattform',
    pub_custom: 'Individuell',
    pub_select_lang: 'Sprache',
    pub_feat1_title: 'KI-Video & Inhaltserstellung',
    pub_feat1_desc: 'Erstellen Sie professionelle Videos, Bilder, Skripte und Voiceovers mit 600+ KI-Modellen.',
    pub_feat2_title: 'Marketingautomatisierung',
    pub_feat2_desc: 'E-Mail-, SMS- und Multi-Channel-Kampagnen mit KI-Texterstellung und Follow-up-Sequenzen.',
    pub_feat3_title: 'CRM & Lead-Management',
    pub_feat3_desc: 'Unbegrenzte Kontakte mit KI-Lead-Scoring, Pipeline-Management und Konversionsprognose.',
    pub_feat4_title: 'KI-Copilot & Automatisierung',
    pub_feat4_desc: 'Konversationeller KI-Assistent mit 50+ Absichten und proaktiven Handlungsempfehlungen.',
    pub_feat5_title: 'KI-Rezeptionist',
    pub_feat5_desc: '24/7 KI-Telefonagent, der Leads qualifiziert, Termine bucht und Anruftranskripte liefert.',
    pub_ben1: 'Ersetzt Synthesia, ClickFunnels, HubSpot, Jasper & mehr — in einer Plattform',
    pub_ben2: '600+ KI-Modelle: GPT-4o, Claude, Gemini, Flux, Veo 3, ElevenLabs & mehr',
    pub_ben3: 'White-Label-Agenturlösung — rebranden und an Kunden weiterverkaufen',
    pub_ben4: 'Integriertes CRM — kein GoHighLevel erforderlich',
    pub_ben5: 'KI-Rezeptionist nimmt Anrufe 24/7 entgegen — verpassen Sie nie einen Lead',
    pub_ben6: 'Unbegrenzte Kontakte, Formulare, Kampagnen und Automatisierungen',
    pub_ben7: 'SOC 2 Typ II-Sicherheit, DSGVO-konform, 2FA aktiviert',
    pub_ben8: '9 Sprachen mit KI-gestützter Übersetzung unterstützt',
    
    // Navigation
    dashboard: 'Dashboard',
    agency_accelerator: 'Agentur Beschleuniger',
    ai_copilot: 'KI-Copilot',
    marketing_suite: 'Marketing Suite',
    video_studio: 'Video Studio',
    ctv_studio: 'CTV Studio',
    ai_art: 'KI-Kunst',
    research: 'Forschung',
    social_media: 'Soziale Medien',
    meta_ads: 'Meta-Anzeigen',
    analytics: 'Analytik',
    copilot_guide: 'Copilot-Leitfaden',
    settings: 'Einstellungen',
    language: 'Sprache',
    
    // Common
    loading: 'Laden...',
    saved: 'Erfolgreich gespeichert',
    select_language: 'Wählen Sie Ihre Sprache',
    no_data: 'Keine Daten verfügbar',
    
    // Home
    hero_title: 'Warum AI Freedom Studios gewinnt',
    hero_sub: 'Von der Idee → Inhalt → Verteilung → Optimierung → Umsatz in unter 40 Minuten.',
    
    // Copilot
    ask_copilot: 'Fragen Sie den KI-Copiloten...',
    copilot_ready: 'KI-Copilot bereit zu helfen'
  },
  
  it: {
    // App General
    app_title: 'AI Freedom Studios',
    presented_by: 'Presentato da AI Freedom Studios',
    welcome_back: 'Bentornato',

    // Public Home
    pub_tagline: 'Piattaforma Aziendale Alimentata da IA',
    pub_hero_badge: 'Piattaforma di Automazione Aziendale IA All-in-One',
    pub_hero_title: 'AI Freedom Studios',
    pub_hero_sub: 'La piattaforma IA completa per creator, marketer e agenzie. Sostituisci 10+ costosi strumenti SaaS con un sistema unificato.',
    pub_hero_sub2: 'Creazione video IA, automazione marketing, CRM, gestione annunci, receptionist IA, automazione flussi — tutto in uno.',
    pub_get_started: 'Inizia',
    pub_sign_in: 'Accedi',
    pub_sign_in_dashboard: 'Accedi alla Dashboard',
    pub_everything_title: 'Tutto ciò di cui il tuo Business ha Bisogno',
    pub_everything_sub: 'AI Freedom Studios combina creazione di contenuti IA, automazione marketing, CRM e analisi in un\'unica potente piattaforma.',
    pub_why_title: 'Perché scegliere AI Freedom Studios?',
    pub_pricing_title: 'Prezzi Semplici e Tutto Incluso',
    pub_pricing_sub: 'A partire da $297/mese — vs. $593+/mese per strumenti separati.',
    pub_cta_title: 'Pronto a Scalare il tuo Business con l\'IA?',
    pub_cta_sub: 'Unisciti a creator e agenzie che generano $10k–$50k/mese con AI Freedom Studios.',
    pub_get_access: 'Ottieni Accesso Ora',
    pub_start_trial: 'Inizia la Prova Gratuita →',
    pub_privacy: 'Privacy',
    pub_terms: 'Termini',
    pub_contact: 'Supporto',
    pub_dev_guide: 'Guida Dev',
    pub_footer_copy: 'Tutti i diritti riservati.',
    pub_popular: 'POPOLARE',
    pub_core_tools: 'Strumenti IA essenziali',
    pub_agency_clients: 'White-label + clienti',
    pub_full_platform: 'Piattaforma completa',
    pub_custom: 'Personalizzato',
    pub_select_lang: 'Lingua',
    pub_feat1_title: 'Creazione Video & Contenuti IA',
    pub_feat1_desc: 'Genera video, immagini, script e voci professionali con 600+ modelli IA.',
    pub_feat2_title: 'Automazione Marketing',
    pub_feat2_desc: 'Campagne email, SMS e multicanale con copywriting IA e sequenze di follow-up.',
    pub_feat3_title: 'CRM & Gestione Lead',
    pub_feat3_desc: 'Contatti illimitati con scoring IA, gestione pipeline e previsione di conversione.',
    pub_feat4_title: 'Copilota IA & Automazione',
    pub_feat4_desc: 'Assistente IA conversazionale con 50+ intenti e suggerimenti di prossima azione migliore.',
    pub_feat5_title: 'Receptionist IA',
    pub_feat5_desc: 'Agente telefonico IA 24/7 che qualifica lead, prenota appuntamenti e fornisce trascrizioni.',
    pub_ben1: 'Sostituisce Synthesia, ClickFunnels, HubSpot, Jasper e altro — in un\'unica piattaforma',
    pub_ben2: '600+ modelli IA: GPT-4o, Claude, Gemini, Flux, Veo 3, ElevenLabs e altro',
    pub_ben3: 'Soluzione agenzia white-label — rebrand e rivendita ai clienti',
    pub_ben4: 'CRM integrato — senza bisogno di GoHighLevel',
    pub_ben5: 'Receptionist IA risponde alle chiamate 24/7 — non perdere mai un lead',
    pub_ben6: 'Contatti, moduli, campagne e automazioni illimitati',
    pub_ben7: 'Sicurezza SOC 2 Tipo II, conforme al GDPR, 2FA abilitato',
    pub_ben8: '9 lingue supportate con traduzione alimentata da IA',
    
    // Navigation
    dashboard: 'Dashboard',
    agency_accelerator: 'Acceleratore Agenzia',
    ai_copilot: 'Copilota IA',
    marketing_suite: 'Suite Marketing',
    video_studio: 'Studio Video',
    ctv_studio: 'Studio CTV',
    ai_art: 'Arte IA',
    research: 'Ricerca',
    social_media: 'Social Media',
    meta_ads: 'Annunci Meta',
    analytics: 'Analitica',
    copilot_guide: 'Guida Copilota',
    settings: 'Impostazioni',
    language: 'Lingua',
    
    // Common
    loading: 'Caricamento...',
    saved: 'Salvato con successo',
    select_language: 'Seleziona la tua lingua',
    no_data: 'Nessun dato disponibile',
    
    // Home
    hero_title: 'Perché AI Freedom Studios vince',
    hero_sub: "Dall'idea → contenuto → distribuzione → ottimizzazione → ricavi in meno di 40 minuti.",
    
    // Copilot
    ask_copilot: 'Chiedi al Copilota IA...',
    copilot_ready: 'Copilota IA pronto ad aiutare'
  },
  
  ar: {
    // App General
    app_title: 'AI Freedom Studios',
    presented_by: 'مقدم من AI Freedom Studios',
    welcome_back: 'مرحبا بعودتك',

    // Public Home
    pub_tagline: 'منصة أعمال مدعومة بالذكاء الاصطناعي',
    pub_hero_badge: 'منصة أتمتة الأعمال الشاملة بالذكاء الاصطناعي',
    pub_hero_title: 'AI Freedom Studios',
    pub_hero_sub: 'المنصة الكاملة للذكاء الاصطناعي للمبدعين والمسوقين والوكالات. استبدل أكثر من 10 أدوات SaaS باهظة الثمن بنظام موحد.',
    pub_hero_sub2: 'إنشاء الفيديو بالذكاء الاصطناعي، أتمتة التسويق، إدارة علاقات العملاء، إدارة الإعلانات، موظف الاستقبال الذكي، أتمتة سير العمل — كل شيء في مكان واحد.',
    pub_get_started: 'ابدأ الآن',
    pub_sign_in: 'تسجيل الدخول',
    pub_sign_in_dashboard: 'الدخول إلى لوحة التحكم',
    pub_everything_title: 'كل ما يحتاجه عملك',
    pub_everything_sub: 'يجمع AI Freedom Studios إنشاء المحتوى بالذكاء الاصطناعي وأتمتة التسويق وإدارة علاقات العملاء والتحليلات في منصة واحدة قوية.',
    pub_why_title: 'لماذا تختار AI Freedom Studios؟',
    pub_pricing_title: 'أسعار بسيطة وشاملة',
    pub_pricing_sub: 'ابتداءً من $297/شهر — مقابل $593+/شهر للأدوات المنفصلة.',
    pub_cta_title: 'هل أنت مستعد لتوسيع نشاطك التجاري باستخدام الذكاء الاصطناعي؟',
    pub_cta_sub: 'انضم إلى المبدعين والوكالات الذين يحققون $10k–$50k/شهر مع AI Freedom Studios.',
    pub_get_access: 'احصل على الوصول الآن',
    pub_start_trial: 'ابدأ التجربة المجانية ←',
    pub_privacy: 'الخصوصية',
    pub_terms: 'الشروط',
    pub_contact: 'الدعم',
    pub_dev_guide: 'دليل المطور',
    pub_footer_copy: 'جميع الحقوق محفوظة.',
    pub_popular: 'الأكثر شيوعاً',
    pub_core_tools: 'أدوات الذكاء الاصطناعي الأساسية',
    pub_agency_clients: 'علامة بيضاء + عملاء',
    pub_full_platform: 'منصة كاملة',
    pub_custom: 'مخصص',
    pub_select_lang: 'اللغة',
    pub_feat1_title: 'إنشاء الفيديو والمحتوى بالذكاء الاصطناعي',
    pub_feat1_desc: 'أنشئ مقاطع فيديو ونصوص وأصواتاً احترافية باستخدام أكثر من 600 نموذج ذكاء اصطناعي.',
    pub_feat2_title: 'أتمتة التسويق',
    pub_feat2_desc: 'حملات بريد إلكتروني ورسائل نصية ومتعددة القنوات مع كتابة نصوص بالذكاء الاصطناعي.',
    pub_feat3_title: 'إدارة علاقات العملاء والعملاء المحتملين',
    pub_feat3_desc: 'جهات اتصال غير محدودة مع تسجيل نقاط الذكاء الاصطناعي وإدارة مسار المبيعات.',
    pub_feat4_title: 'مساعد الذكاء الاصطناعي والأتمتة',
    pub_feat4_desc: 'مساعد ذكاء اصطناعي محادثي مع أكثر من 50 نية واقتراحات الإجراء التالي الأفضل.',
    pub_feat5_title: 'موظف الاستقبال الذكي',
    pub_feat5_desc: 'عميل هاتفي بالذكاء الاصطناعي على مدار الساعة يؤهل العملاء المحتملين ويحجز المواعيد.',
    pub_ben1: 'يستبدل Synthesia وClickFunnels وHubSpot وJasper والمزيد — في منصة واحدة',
    pub_ben2: 'أكثر من 600 نموذج ذكاء اصطناعي: GPT-4o وClaude وGemini وVeo 3 وElevenLabs والمزيد',
    pub_ben3: 'حل وكالة بعلامة بيضاء — أعد العلامة التجارية وأعد البيع للعملاء',
    pub_ben4: 'إدارة علاقات العملاء المدمجة — لا حاجة إلى GoHighLevel',
    pub_ben5: 'موظف الاستقبال الذكي يتعامل مع المكالمات 24/7 — لا تفوتك أي فرصة',
    pub_ben6: 'جهات اتصال وأشكال وحملات وأتمتة غير محدودة',
    pub_ben7: 'أمان SOC 2 النوع الثاني، متوافق مع GDPR، تفعيل 2FA',
    pub_ben8: '9 لغات مدعومة مع ترجمة مدعومة بالذكاء الاصطناعي',
    
    // Navigation
    dashboard: 'لوحة التحكم',
    agency_accelerator: 'مسرع الوكالة',
    ai_copilot: 'مساعد الذكاء الاصطناعي',
    marketing_suite: 'مجموعة التسويق',
    video_studio: 'استوديو الفيديو',
    ctv_studio: 'استوديو CTV',
    ai_art: 'فن الذكاء الاصطناعي',
    research: 'بحث',
    social_media: 'وسائل التواصل الاجتماعي',
    meta_ads: 'إعلانات ميتا',
    analytics: 'التحليلات',
    copilot_guide: 'دليل المساعد',
    settings: 'الإعدادات',
    language: 'اللغة',
    
    // Common
    loading: 'جار التحميل...',
    saved: 'تم الحفظ بنجاح',
    select_language: 'اختر لغتك',
    no_data: 'لا توجد بيانات متاحة',
    
    // Home
    hero_title: 'لماذا يفوز AI Freedom Studios',
    hero_sub: 'من الفكرة → المحتوى → التوزيع → التحسين → الإيرادات في أقل من 40 دقيقة.',
    
    // Copilot
    ask_copilot: 'اسأل مساعد الذكاء الاصطناعي...',
    copilot_ready: 'مساعد الذكاء الاصطناعي جاهز للمساعدة'
  },
  
  ja: {
    // App General
    app_title: 'AI Freedom Studios',
    presented_by: 'AI Freedom Studiosが提供',
    welcome_back: 'おかえりなさい',

    // Public Home
    pub_tagline: 'AIビジネスプラットフォーム',
    pub_hero_badge: 'オールインワンAIビジネス自動化プラットフォーム',
    pub_hero_title: 'AI Freedom Studios',
    pub_hero_sub: 'クリエイター、マーケター、エージェンシーのための完全なAIプラットフォーム。10以上の高価なSaaSツールを1つの統合システムに置き換えましょう。',
    pub_hero_sub2: 'AI動画制作、マーケティング自動化、CRM、広告管理、AIレセプショニスト、ワークフロー自動化 — すべてひとつに。',
    pub_get_started: '始める',
    pub_sign_in: 'サインイン',
    pub_sign_in_dashboard: 'ダッシュボードにサインイン',
    pub_everything_title: 'ビジネスに必要なすべて',
    pub_everything_sub: 'AI Freedom StudiosはAIコンテンツ制作、マーケティング自動化、CRM、分析を1つの強力なプラットフォームに統合。',
    pub_why_title: 'なぜAI Freedom Studiosを選ぶのか？',
    pub_pricing_title: 'シンプルな全込み料金',
    pub_pricing_sub: '月額$297から — 別々のツールでは$593+/月。',
    pub_cta_title: 'AIでビジネスをスケールする準備はできていますか？',
    pub_cta_sub: 'AI Freedom Studiosで月$10k～$50kを生み出すクリエイターやエージェンシーに参加しましょう。',
    pub_get_access: '今すぐアクセスを取得',
    pub_start_trial: '無料トライアルを開始 →',
    pub_privacy: 'プライバシー',
    pub_terms: '利用規約',
    pub_contact: 'サポート',
    pub_dev_guide: '開発者ガイド',
    pub_footer_copy: '全著作権所有。',
    pub_popular: '人気',
    pub_core_tools: '主要AIツール',
    pub_agency_clients: 'ホワイトラベル+クライアント',
    pub_full_platform: 'フルプラットフォーム',
    pub_custom: 'カスタム',
    pub_select_lang: '言語',
    pub_feat1_title: 'AI動画・コンテンツ制作',
    pub_feat1_desc: '600以上のAIモデルでプロ品質の動画、画像、スクリプト、ボイスオーバーを生成。',
    pub_feat2_title: 'マーケティング自動化',
    pub_feat2_desc: 'AIコピーライティング、ファネルビルダー、フォローアップシーケンスを使ったマルチチャネルキャンペーン。',
    pub_feat3_title: 'CRM・リード管理',
    pub_feat3_desc: 'AIリードスコアリング、パイプライン管理、コンバージョン予測付きの無制限コンタクト。',
    pub_feat4_title: 'AIコパイロットと自動化',
    pub_feat4_desc: '50以上のインテントと次の最善行動提案を持つ会話型AIアシスタント。',
    pub_feat5_title: 'AIレセプショニスト',
    pub_feat5_desc: 'リードを評価し、予約を取り、通話の文字起こしを提供する24/7 AI電話エージェント。',
    pub_ben1: 'Synthesia、ClickFunnels、HubSpot、Jasperなどを1つのプラットフォームで代替',
    pub_ben2: '600以上のAIモデル: GPT-4o、Claude、Gemini、Flux、Veo 3、ElevenLabsなど',
    pub_ben3: 'ホワイトラベルエージェンシーソリューション — クライアントにリブランドして再販',
    pub_ben4: '組み込みCRM — GoHighLevelは不要',
    pub_ben5: 'AIレセプショニストが24/7通話対応 — リードを逃しません',
    pub_ben6: '無制限のコンタクト、フォーム、キャンペーン、自動化',
    pub_ben7: 'SOC 2 Type IIセキュリティ、GDPR準拠、2FA対応',
    pub_ben8: 'AI翻訳による9言語サポート',
    
    // Navigation
    dashboard: 'ダッシュボード',
    agency_accelerator: 'エージェンシー アクセラレータ',
    ai_copilot: 'AIコパイロット',
    marketing_suite: 'マーケティング スイート',
    video_studio: 'ビデオ スタジオ',
    ctv_studio: 'CTVスタジオ',
    ai_art: 'AIアート',
    research: 'リサーチ',
    social_media: 'ソーシャルメディア',
    meta_ads: 'Meta広告',
    analytics: 'アナリティクス',
    copilot_guide: 'コパイロット ガイド',
    settings: '設定',
    language: '言語',
    
    // Common
    loading: '読み込み中...',
    saved: '正常に保存されました',
    select_language: '言語を選択',
    no_data: 'データがありません',
    
    // Home
    hero_title: 'AI Freedom Studiosが勝つ理由',
    hero_sub: 'アイデア → コンテンツ → 配信 → 最適化 → 収益を40分以内に。',
    
    // Copilot
    ask_copilot: 'AIコパイロットに質問...',
    copilot_ready: 'AIコパイロットがサポート準備完了'
  },
  
  zh: {
    // App General
    app_title: 'AI Freedom Studios',
    presented_by: '由 AI Freedom Studios 呈献',
    welcome_back: '欢迎回来',

    // Public Home
    pub_tagline: 'AI 驱动的商业平台',
    pub_hero_badge: '一体化 AI 商业自动化平台',
    pub_hero_title: 'AI Freedom Studios',
    pub_hero_sub: '专为创作者、营销人员和机构打造的完整 AI 平台。用一个统一系统替代 10+ 昂贵的 SaaS 工具。',
    pub_hero_sub2: 'AI 视频创作、营销自动化、CRM、广告管理、AI 前台、工作流自动化 — 全部合一。',
    pub_get_started: '立即开始',
    pub_sign_in: '登录',
    pub_sign_in_dashboard: '登录仪表板',
    pub_everything_title: '您的业务所需的一切',
    pub_everything_sub: 'AI Freedom Studios 将 AI 内容创作、营销自动化、CRM 和分析整合到一个强大的平台中。',
    pub_why_title: '为什么选择 AI Freedom Studios？',
    pub_pricing_title: '简单的全包定价',
    pub_pricing_sub: '起价 $297/月 — 与单独工具的 $593+/月相比。',
    pub_cta_title: '准备好用 AI 扩展您的业务了吗？',
    pub_cta_sub: '加入使用 AI Freedom Studios 每月创造 $10k–$50k 的创作者和机构。',
    pub_get_access: '立即获取访问权限',
    pub_start_trial: '开始免费试用 →',
    pub_privacy: '隐私政策',
    pub_terms: '服务条款',
    pub_contact: '联系支持',
    pub_dev_guide: '开发者指南',
    pub_footer_copy: '版权所有。',
    pub_popular: '热门',
    pub_core_tools: '核心 AI 工具',
    pub_agency_clients: '白标 + 客户',
    pub_full_platform: '完整平台',
    pub_custom: '定制',
    pub_select_lang: '语言',
    pub_feat1_title: 'AI 视频与内容创作',
    pub_feat1_desc: '使用 600+ AI 模型生成专业视频、图像、脚本和配音。',
    pub_feat2_title: '营销自动化',
    pub_feat2_desc: '结合 AI 文案撰写、漏斗构建器和跟进序列的电子邮件、短信和多渠道活动。',
    pub_feat3_title: 'CRM 与潜在客户管理',
    pub_feat3_desc: '无限联系人，配备 AI 潜在客户评分、销售管道管理和转化预测。',
    pub_feat4_title: 'AI 副驾驶与自动化',
    pub_feat4_desc: '具有 50+ 意图和主动下一步最佳行动建议的对话式 AI 助手。',
    pub_feat5_title: 'AI 前台',
    pub_feat5_desc: '24/7 AI 电话代理，可资格审查潜在客户、预约并提供通话记录和分析。',
    pub_ben1: '替代 Synthesia、ClickFunnels、HubSpot、Jasper 等 — 全在一个平台',
    pub_ben2: '600+ AI 模型：GPT-4o、Claude、Gemini、Flux、Veo 3、ElevenLabs 等',
    pub_ben3: '白标机构解决方案 — 重新品牌化并转售给客户',
    pub_ben4: '内置 CRM — 无需 GoHighLevel',
    pub_ben5: 'AI 前台 24/7 接听电话 — 永不错过潜在客户',
    pub_ben6: '无限联系人、表单、营销活动和自动化',
    pub_ben7: 'SOC 2 II 型安全性、符合 GDPR、启用 2FA',
    pub_ben8: '支持 9 种语言，具有 AI 驱动的翻译',
    
    // Navigation
    dashboard: '仪表板',
    agency_accelerator: '代理加速器',
    ai_copilot: 'AI 副驾驶',
    marketing_suite: '营销套件',
    video_studio: '视频工作室',
    ctv_studio: 'CTV 工作室',
    ai_art: 'AI 艺术',
    research: '研究',
    social_media: '社交媒体',
    meta_ads: 'Meta 广告',
    analytics: '分析',
    copilot_guide: '副驾驶指南',
    settings: '设置',
    language: '语言',
    
    // Common
    loading: '加载中...',
    saved: '保存成功',
    select_language: '选择您的语言',
    no_data: '无可用数据',
    
    // Home
    hero_title: 'AI Freedom Studios 为何获胜',
    hero_sub: '从创意 → 内容 → 分发 → 优化 → 收益，不到40分钟。',
    
    // Copilot
    ask_copilot: '询问 AI 副驾驶...',
    copilot_ready: 'AI 副驾驶准备就绪'
  }
};

export function useI18n() {
  return useContext(I18nContext);
}

export default function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('afs_lang') || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('afs_lang', lang);
        // Set HTML lang attribute for accessibility
        document.documentElement.lang = lang;
      } catch (e) {
        console.error('Failed to save language preference:', e);
      }
    }
  }, [lang]);

  const t = useMemo(() => {
    return (key, vars) => {
      // First check overrides (localStorage)
      if (typeof window !== 'undefined') {
        try {
          const overrides = JSON.parse(localStorage.getItem('afs_i18n_overrides') || '{}');
          if (overrides[lang]?.[key]) {
            let message = overrides[lang][key];
            
            // Replace variables
            if (vars) {
              Object.keys(vars).forEach(varKey => {
                message = message.replace(new RegExp(`\\{${varKey}\\}`, 'g'), vars[varKey]);
              });
            }
            
            return message;
          }
        } catch (e) {
          console.error('Failed to parse i18n overrides from localStorage:', e);
          // Continue to built-in translations if overrides are corrupted
        }
      }
      
      // Then check built-in translations
      const dictionary = TRANSLATIONS[lang] || TRANSLATIONS.en;
      let message = dictionary[key] || TRANSLATIONS.en[key];
      
      // If no translation exists and not English, check auto-translation cache
      if (!message && lang !== 'en' && typeof window !== 'undefined') {
        const cacheKey = `afs_i18n_cache_${lang}`;
        try {
          const cache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
          message = cache[key];
        } catch (e) {
          console.error('Failed to parse i18n cache from localStorage:', e);
        }
        
        // If still no translation, emit event to request auto-translation
        if (!message && TRANSLATIONS.en[key]) {
          window.dispatchEvent(new CustomEvent('afs:i18n:need', {
            detail: { key, en: TRANSLATIONS.en[key] }
          }));
          message = TRANSLATIONS.en[key]; // Fallback to English while translating
        }
      }
      
      // Final fallback
      if (!message) {
        message = key;
      }
      
      // Replace variables {varName}
      if (vars) {
        Object.keys(vars).forEach(varKey => {
          message = message.replace(new RegExp(`\\{${varKey}\\}`, 'g'), vars[varKey]);
        });
      }
      
      return message;
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  // Listen for translation updates AND override updates
  useEffect(() => {
    const handleUpdate = () => {
      // Force re-render when new translations or overrides arrive
      setLang(l => l); // Trigger re-render
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('afs:i18n:update', handleUpdate);
      window.addEventListener('afs:i18n:overrides:updated', handleUpdate);
      
      return () => {
        window.removeEventListener('afs:i18n:update', handleUpdate);
        window.removeEventListener('afs:i18n:overrides:updated', handleUpdate);
      };
    }
  }, []);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

// Global helper for accessing translations
if (typeof window !== 'undefined') {
  window.__AFS_I18N__ = {
    getLang: () => localStorage.getItem('afs_lang') || 'en',
    setLang: (lang) => {
      localStorage.setItem('afs_lang', lang);
      window.location.reload();
    },
    t: (key, vars) => {
      const lang = localStorage.getItem('afs_lang') || 'en';
      
      // Check overrides first for global helper too
      try {
        const overrides = JSON.parse(localStorage.getItem('afs_i18n_overrides') || '{}');
        if (overrides[lang]?.[key]) {
          let message = overrides[lang][key];
          if (vars) {
            Object.keys(vars).forEach(varKey => {
              message = message.replace(new RegExp(`\\{${varKey}\\}`, 'g'), vars[varKey]);
            });
          }
          return message;
        }
      } catch (e) {
        console.error('Failed to parse i18n overrides for global helper:', e);
      }

      const dictionary = TRANSLATIONS[lang] || TRANSLATIONS.en;
      let message = dictionary[key] || TRANSLATIONS.en[key] || key;
      
      if (vars) {
        Object.keys(vars).forEach(varKey => {
          message = message.replace(new RegExp(`\\{${varKey}\\}`, 'g'), vars[varKey]);
        });
      }
      
      return message;
    }
  };
}
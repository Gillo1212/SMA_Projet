import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const HomePage = lazy(() => import('../pages/home/page'));
const AboutPage = lazy(() => import('../pages/about/page'));
const BlogPage = lazy(() => import('../pages/blog/page'));
const BlogDetailPage = lazy(() => import('../pages/blog/detail/page'));
const ContactPage = lazy(() => import('../pages/contact/page'));
const MachinesPage = lazy(() => import('../pages/machines/page'));
const MachineDetailPage = lazy(() => import('../pages/machines/detail/page'));
const ComparateurPage = lazy(() => import('../pages/machines/comparateur/page'));
const DevisPage = lazy(() => import('../pages/machines/devis/page'));
const ProductsPage = lazy(() => import('../pages/produits/page'));
const ProductDetailPage = lazy(() => import('../pages/produits/detail/page'));
const PanierPage = lazy(() => import('../pages/panier/page'));
const CheckoutPage = lazy(() => import('../pages/checkout/page'));
const ConfirmationPage = lazy(() => import('../pages/commande/confirmation/page'));
const NotFound = lazy(() => import('../pages/NotFound'));

const ConnexionPage = lazy(() => import('../pages/connexion/page'));
const MotDePasseOubliePage = lazy(() => import('../pages/mot-de-passe-oublie/page'));
const ReinitialiserMotDePassePage = lazy(() => import('../pages/reinitialiser-mot-de-passe/page'));
const InscriptionPage = lazy(() => import('../pages/inscription/page'));
const ConfirmationEmailPage = lazy(() => import('../pages/confirmation-email/page'));
const EmailConfirmePage = lazy(() => import('../pages/email-confirme/page'));

const AdminLayout = lazy(() => import('../pages/admin/layout'));
const AdminDashboard = lazy(() => import('../pages/admin/page'));
const AdminCommandesPage = lazy(() => import('../pages/admin/commandes/page'));
const AdminDevisPage = lazy(() => import('../pages/admin/devis/page'));
const AdminMachinesAdminPage = lazy(() => import('../pages/admin/machines/page'));
const AdminProduitsPage = lazy(() => import('../pages/admin/produits/page'));
const AdminClientsPage = lazy(() => import('../pages/admin/clients/page'));
const AdminBlogPage = lazy(() => import('../pages/admin/blog/page'));
const AdminParametresPage = lazy(() => import('../pages/admin/parametres/page'));

const ClientConnexionPage = lazy(() => import('../pages/espace-client/connexion/page'));
const ClientLayout = lazy(() => import('../pages/espace-client/layout'));
const ClientDashboard = lazy(() => import('../pages/espace-client/page'));
const ClientCommandesPage = lazy(() => import('../pages/espace-client/commandes/page'));
const ClientDevisPage = lazy(() => import('../pages/espace-client/devis/page'));
const ClientMachinesPage = lazy(() => import('../pages/espace-client/machines/page'));
const ClientFacturesPage = lazy(() => import('../pages/espace-client/factures/page'));
const ClientSupportPage = lazy(() => import('../pages/espace-client/support/page'));
const ClientProfilPage = lazy(() => import('../pages/espace-client/profil/page'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/a-propos',
    element: <AboutPage />,
  },
  {
    path: '/blog',
    element: <BlogPage />,
  },
  {
    path: '/blog/:slug',
    element: <BlogDetailPage />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
  },
  {
    path: '/machines',
    element: <MachinesPage />,
  },
  {
    path: '/machines/:slug',
    element: <MachineDetailPage />,
  },
  {
    path: '/machines/comparateur',
    element: <ComparateurPage />,
  },
  {
    path: '/machines/devis',
    element: <DevisPage />,
  },
  {
    path: '/produits',
    element: <ProductsPage />,
  },
  {
    path: '/produits/:id',
    element: <ProductDetailPage />,
  },
  {
    path: '/panier',
    element: <PanierPage />,
  },
  {
    path: '/checkout',
    element: <CheckoutPage />,
  },
  {
    path: '/commande/confirmation',
    element: <ConfirmationPage />,
  },
  {
    path: '/connexion',
    element: <ConnexionPage />,
  },
  {
    path: '/inscription',
    element: <InscriptionPage />,
  },
  {
    path: '/mot-de-passe-oublie',
    element: <MotDePasseOubliePage />,
  },
  {
    path: '/reinitialiser-mot-de-passe',
    element: <ReinitialiserMotDePassePage />,
  },
  {
    path: '/confirmation-email',
    element: <ConfirmationEmailPage />,
  },
  {
    path: '/email-confirme',
    element: <EmailConfirmePage />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'commandes', element: <AdminCommandesPage /> },
      { path: 'devis', element: <AdminDevisPage /> },
      { path: 'machines', element: <AdminMachinesAdminPage /> },
      { path: 'produits', element: <AdminProduitsPage /> },
      { path: 'clients', element: <AdminClientsPage /> },
      { path: 'blog', element: <AdminBlogPage /> },
      { path: 'parametres', element: <AdminParametresPage /> },
    ],
  },
  {
    path: '/espace-client/connexion',
    element: <ClientConnexionPage />,
  },
  {
    path: '/espace-client',
    element: <ClientLayout />,
    children: [
      { index: true, element: <ClientDashboard /> },
      { path: 'commandes', element: <ClientCommandesPage /> },
      { path: 'devis', element: <ClientDevisPage /> },
      { path: 'machines', element: <ClientMachinesPage /> },
      { path: 'factures', element: <ClientFacturesPage /> },
      { path: 'support', element: <ClientSupportPage /> },
      { path: 'profil', element: <ClientProfilPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;

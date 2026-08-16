const router = require('express').Router();
const c = require('../controllers/clients.controller');
const { authenticate, requireAdmin, requireClient } = require('../middleware/auth');
const {
  validate,
  clientUpdateRules,
  addClientMachineRules,
  createTicketRules,
} = require('../middleware/validators');

// Admin : gestion des clients
router.get('/', authenticate, requireAdmin, c.getAll);
router.get('/:id', authenticate, c.getById);
router.put('/:id', authenticate, clientUpdateRules, validate, c.update);
router.patch('/:id/toggle-active', authenticate, requireAdmin, c.toggleActive);

// Parc machines
router.get('/:id/machines', authenticate, c.getClientMachines);
router.post('/:id/machines', authenticate, requireAdmin, addClientMachineRules, validate, c.addClientMachine);
router.patch('/:id/machines/:machineId', authenticate, requireAdmin, c.updateClientMachineStatus);

// Support / Tickets
router.get('/:id/tickets', authenticate, c.getTickets);
router.post('/tickets', authenticate, requireClient, createTicketRules, validate, c.createTicket);

// Factures
router.get('/:id/invoices', authenticate, c.getInvoices);

module.exports = router;

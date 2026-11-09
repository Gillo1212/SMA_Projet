// Tests sur une vraie base : la remise à zéro (TRUNCATE + données de test) peut
// dépasser les 5 s par défaut sur une machine chargée ou un MySQL tout juste démarré.
jest.setTimeout(30000);

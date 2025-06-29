describe('Local Data Lister', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:5000/login', { 
      username: 'admin', 
      password: 'pass' 
    })
    .then(res => {
      cy.visit('http://localhost:5173', {
        onBeforeLoad: (win) => { 
          win.localStorage.setItem('token', res.body.token); 
        }
      });
    });
  });

  it('loads and displays items', () => {
    cy.get('h1').should('contain', 'Local Data Lister');
    cy.get('li').should('have.length.at.least', 1);
  });

  it('filters items', () => {
    cy.get('input').type('Restaurant{enter}');
    cy.get('li').should('contain', 'Joe\'s Pizza');
  });
});
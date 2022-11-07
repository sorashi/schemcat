describe('regression', () => {
  it('Changing values in ControlPanel reflects immediately', () => {
    cy.visit('/')

    cy.contains('Person').click()
    cy.get('dt')
      .contains('label')
      .next()
      .find('input')
      .focus()
      .type('{selectAll}{backspace}Human')
      .blur()
    cy.get('svg span').should('contain.text', 'Human')
  })
})

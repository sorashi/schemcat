describe('regression', () => {
  it('Changing values in ControlPanel reflects immediately', () => {
    cy.visit('/')

    cy.contains('Person').click()
    cy.get('dt').contains('label').next().find('input').focus().type('{selectAll}{backspace}Human').blur()
    cy.get('svg span').should('contain.text', 'Human')
  })
  it('#44: ExportSvgDialog dialog interaction available', () => {
    cy.visit('/')

    cy.get('ul').contains('File').click()
    cy.get('ul').contains('Export as').click()
    cy.get('ul').contains('SVG').click()
    cy.get('form').contains('Include serialized diagram').click()

    cy.get('form').contains('Include serialized diagram').find('input').its('0.checked').should('be.false')

    cy.get('form').get('button').contains('Cancel').click()
  })
})

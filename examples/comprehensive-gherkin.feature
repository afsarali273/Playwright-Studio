Feature: Generated Feature

Scenario: Generated Scenario

Given web open browser

And web navigate to "https://www.google.com/"

When web click element "getByRole('combobox', { name: 'Search' })"

When web type "Afsar" into "getByRole('combobox', { name: 'Search' })"

When web press enter on element "getByRole('combobox', { name: 'Search' })"

And web navigate to "https://www.google.com/search?q=Afsar&sca_esv=c965cb4cff351783&source=hp&ei=p9KaacWzNpaIqfkPkIeAqQI&iflsig=AFdpzrgAAAAAaZrgt26ybfVvnuNNrC10KiR5iL83Ow9P&ved=0ahUKEwiFo-nG6uySAxUWRCoJHZADICUQ4dUDCCg&uact=5&oq=Afsar&gs_lp=Egdnd3Mtd2l6IgVBZnNhcjIKEAAYgAQYQxiKBTIKEAAYgAQYQxiKBTIKEAAYgAQYQxiKBTIKEAAYgAQYQxiKBTIKEAAYgAQYQxiKBTIJEAAYgAQYChgLMgUQABiABDIFEC4YgAQyCRAAGIAEGAoYCzIJEAAYgAQYChgLSKkNUKIEWNwIcAF4AJABAJgBSqABzgKqAQE1uAEDyAEA-AEBmAIGoALqAqgCCsICExAAGIAEGEMYtAIY5wYYigUY6gLCAhMQLhiABBhDGLQCGOcGGIoFGOoCwgIQEC4YgAQY0QMYQxjHARiKBcICDhAuGIAEGLEDGIMBGIoFwgIKEC4YgAQYQxiKBcICCBAAGIAEGLEDwgIZEC4YgAQYsQMY0QMYQxiDARjHARjJAxiKBcICCBAAGIAEGJIDwgILEC4YgAQY0QMYxwHCAgcQABiABBgKwgIREC4YgAQYxwEYmAUYmQUYrwGYAwriAwUSATEgQPEFEbNIWEVUdkiSBwE2oAeCM7IHATW4B98CwgcFMC40LjLIBxOACAA&sclient=gws-wiz"

Then web element "getByText('Login')" should be visible

Then web element "getByText('Home')" text should be "Home"

Then web element "getByText('Absher (application)')" should be visible


import { snippetCompletion } from '@codemirror/autocomplete'

const html = `<!DOCTYPE html>`
           + `\n<html lang="en">`
           + `\n<head>`
           + `\n<meta charset="UTF-8" />`
           + `\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />`
           + `\n<title></title>`
           + `\n</head>`
           + `\n<body>`
           + `\n</body>`
           + `\n</html>\n`

const jquery = `<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>\n`

const bootstrap = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">`
                + `\n<script src="https://cdn.jsdelivr.net/npm/popper.js@1.14.7/dist/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>`
                + `\n<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>`

const html5Snippet = snippetCompletion(html, {
    label: 'html:5',
    detail: 'HTML5 boilerplate'
});

const jquerySnippet = snippetCompletion(jquery, {
    label: 'jQuery',
    detail: 'Script tag for JQuery'        
});

const bootstrapSnippet = snippetCompletion(bootstrap, {
    label: 'Bootstrap',
    detail: 'Link & Script tags for Bootstrap'
});

export {    
            html5Snippet,
            jquerySnippet, 
            bootstrapSnippet,
        };
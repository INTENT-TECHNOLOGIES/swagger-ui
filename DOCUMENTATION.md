##Ajouter une page
- Ajouter un fichier "mapage.handlebars" dans `src/custom/template/pages`
```html
<section class="web-container">
  <article>
    <header>
      <h1>Titre article</h1>
      <p>Description courte</p>
    </header>
    <section>
      <h2>Sous titre</h2>
      <p>Texte </p>
      ...
    </section>
  </article>
</section>
```
- Ajouter un nouveau block dans la variable `pages` dans `gulpfile.js`
```json
{
  'filename': 'nom-du-fichier-généré-au-build.html',
  'lang': 'langue-de-l-article',
  'title': 'titre-onglet-navigateur',
  'desc': 'meta-description-html',
  'navDoc': true-si-menu-documentation-sélectionné-dans-le-header,
  'navApi': true-si-menu-apireference-sélectionné-dans-le-header,
  'template': 'nom-du-template-ajouté-sans-extension'
}
```
- Exécuter la commande : `gulp build`

Les fichiers sont générés dans le dossier `dist/optimized/html`.

##Mettre à jour Swagger-ui
Toutes les modifications ont été apportées dans des dossiers séparés :
- `src/custom`
- `dist/optimized`
- `gulpfile.js`
À l'exception de la lib `lib/swagger-oauth.js`.
De ce fait le merge avec une nouvelle version de Swagger-ui devrait être relativement simple.
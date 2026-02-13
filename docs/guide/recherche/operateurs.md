---
label: "Opérateurs"
title: "Opérateurs de recherche"
description: "Combinez des opérateurs (&&, ||, !, guillemets, jokers) pour construire des requêtes précises."
order: 1
keywords: [opérateurs, AND, OR, NOT, guillemets, joker, wildcard, expression, exacte, lucene]
---

Vous pouvez combiner des opérateurs pour construire des requêtes précises. Ces opérateurs
utilisent des symboles, pas de mots en anglais.

## Référence des opérateurs

| Opérateur | Rôle | Exemple | Résultat |
|-----------|------|---------|----------|
| `&&` | Les deux termes doivent être présents | `nucléaire && énergie` | Formations contenant « nucléaire » **et** « énergie » |
| `\|\|` | Au moins un des termes | `physique \|\| chimie` | Formations contenant « physique » **ou** « chimie » (comportement par défaut) |
| `!` ou `-` | Exclure un terme | `nucléaire !médecine` | Formations avec « nucléaire » mais **sans** « médecine » |
| `"..."` | Expression exacte | `"intelligence artificielle"` | Formations contenant l'expression exacte « intelligence artificielle » |
| `*` | Joker (plusieurs caractères) | `inform*` | Formations avec des termes commençant par « inform » (informatique, information…) |
| `?` | Joker (un seul caractère) | `chimi?` | Formations avec « chimie » ou « chimio » etc. |
| `( )` | Grouper des conditions | `(physique \|\| chimie) && !médecine` | Physique ou chimie, mais pas médecine |

## Recherche par expression exacte

Les guillemets sont particulièrement utiles pour rechercher un intitulé précis. Sans
guillemets, chaque mot est recherché indépendamment.

- `"sciences politiques"` — trouvera l'expression exacte
- `sciences politiques` — trouvera aussi des formations de sciences sans lien avec le politique

## Exclusion de termes

L'opérateur d'exclusion (`!` ou `-`) permet d'affiner une recherche trop large en retirant des résultats non pertinents. Placez-le directement devant le terme à exclure, sans espace.

- `informatique !réseau` — informatique sans les formations liées aux réseaux
- `"génie civil" && !alternance` — génie civil, en excluant les formations en alternance

## Jokers

Les jokers permettent de rechercher des variantes d'un mot sans connaître l'orthographe complète.

- `*` remplace zéro ou plusieurs caractères : `bio*` trouvera biologie, biotechnologie, bioéthique…
- `?` remplace exactement un caractère : `chimi?` trouvera chimie, chimio…

> [!WARNING]
> **Attention :** les jokers ne fonctionnent pas en début de mot (par exemple `*logie` ne donnera pas de résultats). Placez-les toujours en milieu ou en fin de mot.

## Groupement de conditions

Les parenthèses permettent de construire des requêtes complexes en groupant des
sous-expressions. C'est indispensable quand vous combinez plusieurs opérateurs.

- `(droit || juridique) && européen` — formations en droit ou juridique avec une dimension européenne
- `(intelligence || artificielle) && (master || ingénieur)` — formations liées à l'IA de niveau Master ou Ingénieur

> [!NOTE]
> **Combinez recherche et filtres** pour des résultats encore plus précis.
> Par exemple, saisissez `"data science"` dans la barre de recherche puis
> appliquez les [filtres avancés](/guide/recherche/filtres) pour
> restreindre par cycle « Master » et région « Île-de-France ».

Consultez la page [Exemples de recherches](/guide/recherche/exemples) pour des illustrations complètes combinant opérateurs, expressions exactes et filtres.
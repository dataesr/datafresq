---
label: "Filtres avancés"
title: "Filtres avancés"
description: "Restreignez les résultats par cycle, diplôme, académie, établissement, secteur et domaine."
order: 2
keywords: [filtres, cycle, diplôme, académie, établissement, secteur, domaine, licence, master]
---

En complément de la recherche textuelle, vous pouvez appliquer des filtres pour
restreindre les résultats selon plusieurs critères. Les filtres se combinent entre eux
et avec la recherche textuelle.

## Filtres disponibles

| Filtre | Description |
|--------|-------------|
| **Cycle** | Licence (L), Master (M), Doctorat (D), etc. |
| **Type de diplôme** | Master, Licence, Diplôme d'ingénieur, BUT, etc. |
| **Catégorie de diplôme** | Diplôme national, Titre d'ingénieur, etc. |
| **Académie / Région** | Localisation géographique des établissements |
| **Établissement** | Recherche par nom d'établissement |
| **Secteur** | Public ou privé |
| **Secteur disciplinaire** | Sciences, Lettres, Droit, etc. |
| **Domaine** | Domaine de formation (Arts, Sciences humaines, etc.) |
| **Données disponibles** | Filtrer les formations ayant des données SISE, RNCP ou ROME |

## Logique de combinaison

Chaque filtre permet de sélectionner une ou plusieurs valeurs. Les valeurs au sein d'un
même filtre fonctionnent en **« ou »** : une formation correspondant à l'une des valeurs
sélectionnées sera affichée.

Les filtres de catégories différentes se combinent en **« et »** : une formation doit
satisfaire tous les filtres actifs pour apparaître dans les résultats.

> [!NOTE]
> **Exemple :** sélectionner les cycles « Licence » et « Master » dans le filtre Cycle, puis « Île-de-France » dans le filtre Région, affichera les formations de Licence *ou* de Master situées en Île-de-France.

## Filtre par données disponibles

Ce filtre est particulièrement utile pour isoler les formations disposant d'un jeu de
données spécifique :

- **Données SISE disponibles** — formations avec des effectifs étudiants (voir [SISE](/guide/donnees/sise))
- **Données RNCP disponibles** — formations enregistrées au Répertoire National des Certifications Professionnelles
- **Données ROME disponibles** — formations avec des débouchés métier référencés (voir [ROME et RNCP](/guide/donnees/rome))

## Réinitialiser les filtres

Pour supprimer tous les filtres actifs, cliquez sur le bouton de réinitialisation situé
à côté des filtres. Vous pouvez également retirer un filtre individuel en cliquant sur
la croix associée à sa valeur dans la barre de filtres actifs.

## Combiner filtres et opérateurs

Les filtres se combinent naturellement avec les [opérateurs de recherche](/guide/recherche/operateurs). Par exemple, saisissez `"data science"` dans la barre de recherche, puis filtrez par cycle « Master » et région « Île-de-France » pour obtenir les masters en data science franciliens.

Consultez la page [Exemples de recherches](/guide/recherche/exemples) pour des illustrations complètes.
---
label: "Insertion professionnelle"
title: "Insertion professionnelle (espace)"
description: "Taux d'emploi, salaires et distribution par formation dans un espace de travail."
order: 8
keywords: [insertion, emploi, salaire, espace, agrégé, cohorte, sortants, quantile, boxplot, évolution]
---

L'onglet « Insertion professionnelle » d'un espace de travail présente les données
d'insertion issues du dispositif [InserSup](/guide/donnees/insersup),
agrégées sur l'ensemble des formations de l'espace. Un sélecteur en haut de page
permet de choisir une promotion (cohorte) ou d'afficher l'évolution à travers
les promotions.

## Indicateurs

Des cartes résument les données de la promotion sélectionnée :

| Carte | Description |
|-------|-------------|
| **Formations** | Nombre de formations de l'espace disposant de données InserSup pour cette promotion, sur le total de formations de l'espace |
| **Diplômés suivis** | Nombre total de diplômés suivis par InserSup (sortants + poursuivants) |
| **Sortants** | Nombre de diplômés entrés sur le marché du travail |
| **Poursuivants** | Nombre de diplômés ayant repris des études |
| **Taux de poursuite** | Part des diplômés ayant poursuivi leurs études (poursuivants / diplômés suivis × 100) |

Lorsque le nombre de sortants atteint le seuil de confidentialité de 20, quatre
graphiques sont affichés pour la promotion sélectionnée :

- **Taux d'emploi salarié** — courbe du taux d'emploi salarié en France à chaque
  échéance (M+6, M+12, M+18, M+24, M+30), calculé comme une moyenne pondérée par le
  nombre de sortants de chaque formation
- **Distribution du taux d'emploi** — boîte à moustaches (boxplot) montrant la
  dispersion du taux d'emploi entre les formations de l'espace (min, Q1, médiane, Q3,
  max) avec la moyenne pondérée en pointillés
- **Taux d'emploi stable** — courbe du taux d'emploi stable (CDI, fonctionnaires) parmi
  les emplois salariés, à chaque échéance
- **Taux d'emploi par genre** — courbes comparant le taux d'emploi salarié des femmes
  et des hommes à chaque échéance

> [!NOTE]
> Le graphique de distribution nécessite au moins 4 formations ayant chacune 20 sortants
> ou plus. Si ce minimum n'est pas atteint, un message explicatif est affiché.

> [!TIP]
> Un écart important entre Q1 et Q3 indique que les formations de l'espace ont des taux
> d'insertion très différents. Un écart faible signifie que les formations sont homogènes
> en termes d'insertion.

Sous les graphiques, un tableau liste les formations de l'espace avec leurs données
d'insertion individuelles : nombre de sortants, taux d'emploi salarié à chaque échéance.

## Évolution

Lorsqu'au moins deux promotions disposent de données suffisantes (20 sortants minimum),
la vue « Évolution » affiche :

- **Évolution du taux d'emploi salarié** — courbes par échéance à travers les promotions
- **Évolution du taux d'emploi stable** — même principe pour l'emploi stable

Ces graphiques permettent de comparer l'insertion de différentes promotions et de repérer
des tendances sur plusieurs années.

## Disponibilité des données

Cet onglet n'affiche des données que si au moins une formation de l'espace dispose de
données [InserSup](/guide/donnees/insersup). Si aucune formation n'est
couverte, un message indique l'absence de données d'insertion pour l'espace.

Lorsque le nombre total de sortants pour une promotion est inférieur à 20, les
graphiques ne sont pas affichés. Les cartes de synthèse restent visibles. L'agrégation
de plusieurs formations peut permettre d'atteindre ce seuil même si les formations
individuelles ne l'atteignent pas.

## Liens utiles

- [Taux d'emploi](/guide/indicateurs/emploi) — formules, population de référence, échéances et agrégation
- [Données salariales](/guide/indicateurs/salaires) — quartiles, interprétation
- [Seuils de confidentialité](/guide/indicateurs/seuils) — conditions d'affichage et impact sur les espaces
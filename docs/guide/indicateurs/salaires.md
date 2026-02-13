---
label: "Données salariales"
title: "Données salariales"
description: "Quartiles de salaire net mensuel : Q1, médiane et Q3."
order: 3
keywords: [salaires, quartile, médiane, Q1, Q3, net, mensuel, rémunération]
---

Les salaires affichés dans DataFresq sont des **salaires nets mensuels**,
exprimés en euros. Ils sont issus des déclarations sociales nominatives (DSN) via le
dispositif [InserSup](/guide/donnees/insersup) et concernent les emplois
salariés en France uniquement.

## Quartiles

Les salaires sont présentés sous forme de trois quartiles :

| Quartile | Signification |
|----------|---------------|
| **Q1 (1er quartile)** | 25 % des salariés gagnent moins que cette valeur |
| **Médiane (Q2)** | 50 % des salariés gagnent moins que cette valeur |
| **Q3 (3e quartile)** | 75 % des salariés gagnent moins que cette valeur |

> [!NOTE]
> **Exemple :** si la médiane est de 2 000 €, cela signifie que la moitié
> des diplômés en emploi salarié gagnent moins de 2 000 € nets par mois, et l'autre
> moitié gagne plus. L'écart entre Q1 et Q3 reflète la dispersion des salaires pour
> cette formation.

## Pourquoi des quartiles plutôt qu'une moyenne ?

Les quartiles sont préférés à la moyenne car ils sont moins sensibles aux valeurs
extrêmes. Une formation avec quelques diplômés à très haut salaire pourrait fausser une
moyenne, alors que la médiane reste représentative de la situation typique d'un diplômé.

L'écart interquartile (Q3 − Q1) donne une indication de la **dispersion**
des salaires :

- Un écart faible indique que les salaires sont concentrés autour de la médiane — les diplômés accèdent à des niveaux de rémunération similaires.
- Un écart important indique une forte dispersion — les parcours professionnels des diplômés mènent à des niveaux de rémunération très variés.

## Lecture des quartiles

En règle générale, les salaires augmentent avec le temps écoulé depuis le diplôme. Les
écarts entre promotions peuvent refléter des effets conjoncturels (contexte économique)
ou structurels (évolution du marché de l'emploi dans le domaine).

Les graphiques de salaires sont disponibles sur les
[fiches formation](/guide/formations/insertion#données-salariales) et dans les
[espaces de travail](/guide/espaces/insertion).

## Agrégation dans les espaces de travail

Dans un [espace de travail](/guide/espaces/insertion), les données salariales sont
recalculées sur l'ensemble agrégé des formations. Les quartiles sont recalculés à partir
de la distribution complète des salaires observés pour tous les diplômés des formations de
l'espace, et non comme une moyenne des quartiles individuels.

Cette méthode garantit que les quartiles agrégés reflètent fidèlement la distribution
réelle des salaires dans le périmètre de l'espace.

> [!WARNING]
> **Attention :** l'agrégation de formations aux profils salariaux très
> différents (par exemple un master en finance et un master en lettres) produira une
> distribution bimodale. Les quartiles agrégés masqueront cette hétérogénéité. Pour
> une analyse fine, préférez des espaces de travail regroupant des formations
> comparables.

## Seuils d'affichage

Les données salariales ne sont affichées que lorsque le nombre de diplômés pour lesquels
un salaire est observé dans les DSN atteint un minimum de **5** pour la formation, la
cohorte et l'échéance concernées. Ce seuil est plus bas que celui des taux d'emploi
(20 sortants) car les données sont agrégées sous forme de quartiles et non individuelles.

Lorsque les données sont masquées en raison d'un seuil non atteint, un message explicatif
est affiché à la place des valeurs, indiquant le nombre réel de diplômés salariés.

Pour en savoir plus sur les conditions d'affichage, consultez la page
[Seuils de confidentialité](/guide/indicateurs/seuils).

## Disponibilité des données

Les données salariales proviennent du dispositif
[InserSup](/guide/donnees/insersup) et ne sont disponibles que pour les
formations couvertes par ce dispositif.

L'agrégation de plusieurs formations dans un
[espace de travail](/guide/espaces/insertion) peut permettre d'atteindre le seuil
minimum de 5 diplômés salariés même si les formations individuelles ne l'atteignent pas.
C'est un des avantages majeurs des espaces pour analyser les petites formations.
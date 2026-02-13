---
label: "ROME et RNCP"
title: "ROME et RNCP"
description: "Référentiels des métiers et des certifications professionnelles."
order: 4
keywords: [ROME, RNCP, métiers, certifications, France Travail, France Compétences]
---

Les données sur les débouchés professionnels proviennent du croisement de deux
référentiels complémentaires : le RNCP (certifications) et le ROME (métiers).

## RNCP — Répertoire National des Certifications Professionnelles

Le **RNCP**, géré par France Compétences, répertorie les certifications
professionnelles reconnues par l'État. Chaque formation certifiée y est enregistrée
avec :

- Un code RNCP unique
- Les compétences attestées
- Les types d'emploi accessibles
- Les codes ROME correspondant aux métiers visés

C'est via le RNCP que DataFresq établit le lien entre une formation et les métiers
auxquels elle prépare. Les formations [Fresq](/guide/donnees/fresq) disposant de codes RNCP sont
automatiquement reliées aux fiches de certification correspondantes.

## ROME — Répertoire Opérationnel des Métiers et des Emplois

Le **ROME**, maintenu par France Travail (ex Pôle Emploi), est un
référentiel qui répertorie et classifie l'ensemble des métiers. Il est organisé de
manière hiérarchique :

| Niveau | Description | Exemple |
|--------|-------------|---------|
| **Niveau 1** | Grands domaines professionnels | Agriculture et Pêche, Industrie, Services… |
| **Niveau 2** | Catégories de métiers | Informatique et Télécommunications |
| **Niveau 3** | Familles de métiers | Études et développement informatique |
| **Métier** | Appellations précises | Développeur web, Ingénieur logiciel… |

## Chaîne d'appariement

Le lien entre une formation et ses débouchés professionnels suit la chaîne suivante :

1. La formation est associée à un ou plusieurs **codes RNCP** dans le référentiel Fresq.
2. Chaque fiche RNCP référence des **codes ROME** correspondant aux métiers visés par la certification.
3. Les codes ROME sont résolus dans le référentiel ROME pour obtenir les intitulés, la hiérarchie complète et les appellations métier.

## Utilisation dans DataFresq

Les données ROME et RNCP alimentent l'onglet
[« Débouchés »](/guide/formations/debouches) des fiches formation. Cet
onglet présente :

- Les **métiers ROME** associés, organisés par domaine professionnel
- Les **types d'emploi** accessibles, issus de la fiche RNCP

La recherche textuelle porte également sur les appellations ROME et les types d'emploi
RNCP. Vous pouvez donc rechercher un métier (par exemple
`"développeur web"`) pour trouver les formations qui y mènent.

## Couverture et limites

Seules les formations ayant un code RNCP disposent de données sur les débouchés
professionnels.

> [!WARNING]
> Le filtre [« Données ROME disponibles »](/guide/recherche/filtres) dans la
> recherche permet de n'afficher que les formations ayant des débouchés référencés. C'est
> utile pour identifier rapidement les formations certifiées disposant d'informations sur
> les métiers visés.

## Fréquence de mise à jour

Les référentiels RNCP et ROME sont mis à jour en continu par leurs producteurs respectifs
(France Compétences et France Travail). Les modifications sont intégrées dans DataFresq
lors des mises à jour périodiques de la plateforme.

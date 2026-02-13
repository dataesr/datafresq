---
label: "Base Fresq"
title: "Base Fresq"
description: "Référentiel officiel des formations : identité, accréditation, établissements."
order: 1
keywords: [Fresq, référentiel, formation, accréditation, INF, MESR]
---

La base **Fresq** (Formation Reconnues de l’Enseignement Supérieur de Qualité)
est le référentiel officiel des formations de l'enseignement supérieur français,
maintenu par le MESR. Elle constitue le socle de DataFresq : chaque formation affichée
dans la plateforme provient de ce référentiel.

## Données fournies

- **Identité de la formation** : intitulé officiel, code INF (identifiant unique), mention
- **Diplôme** : type (Master, Licence, BUT, Diplôme d'ingénieur…), code, catégorie
- **Accréditation** : période de validité (dates de début et de fin), permettant de déterminer si la formation est actuellement accréditée
- **Établissements porteurs** : un ou plusieurs établissements avec leur UAI, nom, sigle, adresse, académie, région et secteur (public/privé)
- **Parcours et étapes** : décomposition pédagogique de la formation (spécialisations, options)
- **Domaines et mots-clés** : classification thématique
- **Informations pédagogiques** : disciplines, langues d'enseignement, attendus, diplômes recommandés
- **Liens RNCP et SISE** : codes permettant l'appariement avec les autres sources de données

## Rôle dans DataFresq

La base Fresq est la source principale de DataFresq. C'est elle qui détermine la liste
des formations consultables sur la plateforme. Les autres sources de données
([SISE](/guide/donnees/sise),
[InserSup](/guide/donnees/insersup),
[ROME/RNCP](/guide/donnees/rome)) sont appariées à partir des
identifiants fournis par Fresq.

Concrètement, lorsque vous consultez une
[fiche formation](/guide/formations/informations), toutes les
informations des onglets « Informations générales » et « Parcours » proviennent de la base Fresq.

## Mise à jour

La base Fresq est mise à jour en continu par les établissements et le MESR. Les
modifications sont répercutées dans DataFresq lors des mises à jour périodiques de la
plateforme.

> [!NOTE]
> Un décalage peut exister entre une modification dans le référentiel Fresq et sa prise
> en compte dans DataFresq. Si vous constatez une information obsolète, elle sera
> corrigée lors de la prochaine synchronisation.

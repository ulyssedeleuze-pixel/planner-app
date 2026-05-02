# PlanMaster – Design Document

## Brand & Color Palette

| Token      | Light                | Dark                 | Usage                        |
|------------|----------------------|----------------------|------------------------------|
| primary    | `#6366F1` (Indigo)   | `#818CF8`            | Accents, boutons principaux  |
| background | `#FFFFFF`            | `#0F0F14`            | Fond général                 |
| surface    | `#F3F4F6`            | `#1A1A24`            | Cartes, panneaux             |
| foreground | `#111827`            | `#F1F5F9`            | Texte principal              |
| muted      | `#6B7280`            | `#94A3B8`            | Texte secondaire             |
| border     | `#E5E7EB`            | `#2D2D3D`            | Bordures                     |
| success    | `#10B981`            | `#34D399`            | Événements confirmés         |
| warning    | `#F59E0B`            | `#FBBF24`            | Rappels                      |
| error      | `#EF4444`            | `#F87171`            | Erreurs, suppressions        |

## Screen List

1. **CalendarScreen (Accueil)** – Vue mensuelle avec points d'événements
2. **WeekScreen** – Vue hebdomadaire avec grille horaire
3. **DayScreen** – Vue journalière détaillée avec timeline
4. **EventListScreen** – Liste de tous les événements à venir
5. **EventDetailScreen** – Détail d'un événement (lecture)
6. **EventFormScreen** – Création / modification d'un événement
7. **RemindersScreen** – Gestion des rappels

## Primary Content & Functionality

### CalendarScreen
- Grille mensuelle (7 colonnes × 6 lignes)
- Indicateurs colorés sous les jours avec événements
- Sélection d'un jour → affiche les événements du jour en bas
- Bouton FAB (+) pour créer un événement

### WeekScreen
- Colonnes pour chaque jour de la semaine
- Lignes horaires (00h–23h)
- Blocs colorés représentant les événements
- Scroll vertical pour naviguer dans la journée

### DayScreen
- Timeline verticale avec heures
- Événements affichés comme blocs dans la timeline
- Bouton FAB (+) pour ajouter un événement à cette date

### EventListScreen
- FlatList des événements triés par date
- Sections par date (aujourd'hui, demain, cette semaine…)
- Swipe-to-delete sur chaque item

### EventDetailScreen
- Titre, description, date/heure de début et fin
- Couleur de catégorie
- Rappels associés
- Boutons Modifier / Supprimer

### EventFormScreen
- Champs : Titre (requis), Description, Date début, Date fin, Couleur, Rappels
- DateTimePicker natif
- Sélecteur de couleur (6 couleurs prédéfinies)
- Ajout de rappels (5 min, 15 min, 30 min, 1h, 1 jour avant)

### RemindersScreen
- Liste des rappels planifiés
- Toggle activer/désactiver
- Suppression individuelle

## Key User Flows

### Créer un événement
1. Onglet Calendrier → FAB (+)
2. EventFormScreen → remplir titre, date, heure
3. Optionnel : ajouter rappels, couleur, description
4. Appuyer sur "Enregistrer"
5. Retour au calendrier avec l'événement visible

### Consulter un événement
1. Onglet Calendrier → sélectionner un jour
2. Appuyer sur un événement dans la liste du bas
3. EventDetailScreen → lire les détails

### Modifier un événement
1. EventDetailScreen → bouton "Modifier"
2. EventFormScreen pré-rempli
3. Modifier les champs → "Enregistrer"

### Supprimer un événement
1. EventDetailScreen → bouton "Supprimer"
2. Confirmation → suppression et retour au calendrier

## Navigation Structure

```
TabNavigator
├── (tabs)/calendar   → CalendarScreen
├── (tabs)/week       → WeekScreen
├── (tabs)/events     → EventListScreen
└── (tabs)/reminders  → RemindersScreen

Stack (modal)
├── event/[id]        → EventDetailScreen
└── event/new         → EventFormScreen
```

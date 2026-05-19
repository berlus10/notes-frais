import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PrimaryButton } from '../components/PrimaryButton'
import { SectionTitle } from '../components/SectionTitle'
import { colors, radius, shadow, spacing } from '../theme/theme'

const categories = ['Voiture', 'Moto', 'Train', 'Repas', 'Hôtel', 'Autre']

export function NewReportScreen() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [kilometers, setKilometers] = useState('')
  const [manualAmount, setManualAmount] = useState('')

  const km = Number(kilometers.replace(',', '.')) || 0
  const amount = Number(manualAmount.replace(',', '.')) || 0
  const isKilometric = selectedCategory === 'Voiture' || selectedCategory === 'Moto'
  const estimatedAmount = isKilometric
    ? km * (selectedCategory === 'Voiture' ? 0.36 : 0.14)
    : amount

  function handleCategoryPress(category: string) {
    setSelectedCategory(category)
    setKilometers('')
    setManualAmount('')
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Nouvelle note</Text>
      <Text style={styles.copy}>Ajoutez les informations de l’action et vos dépenses.</Text>

      <View style={styles.card}>
        <SectionTitle>Informations</SectionTitle>
        <TextInput placeholder="Commission" placeholderTextColor={colors.mutedText} style={styles.input} />
        <TextInput placeholder="Objet / Action" placeholderTextColor={colors.mutedText} style={styles.input} />
        <View style={styles.row}>
          <TextInput placeholder="Départ" placeholderTextColor={colors.mutedText} style={[styles.input, styles.half]} />
          <TextInput placeholder="Arrivée" placeholderTextColor={colors.mutedText} style={[styles.input, styles.half]} />
        </View>
      </View>

      <View style={styles.card}>
        <SectionTitle>Dépense 1</SectionTitle>
        <View style={styles.chips}>
          {categories.map((category) => {
            const isSelected = selectedCategory === category
            return (
            <TouchableOpacity
              key={category}
              activeOpacity={0.85}
              style={[styles.chip, isSelected && styles.chipActive]}
              onPress={() => handleCategoryPress(category)}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{category}</Text>
            </TouchableOpacity>
            )
          })}
        </View>
        <View style={styles.row}>
          {isKilometric && (
            <TextInput
              placeholder="Kilomètres"
              keyboardType="numeric"
              placeholderTextColor={colors.mutedText}
              style={[styles.input, styles.half]}
              value={kilometers}
              onChangeText={setKilometers}
            />
          )}
          <TextInput
            placeholder="Montant"
            keyboardType="numeric"
            placeholderTextColor={colors.mutedText}
            style={[styles.input, styles.half]}
            value={isKilometric ? estimatedAmount.toFixed(2) : manualAmount}
            onChangeText={setManualAmount}
            editable={!isKilometric}
          />
        </View>
        <TextInput placeholder="Description" placeholderTextColor={colors.mutedText} style={styles.input} />

        <TouchableOpacity activeOpacity={0.85} style={styles.upload}>
          <Ionicons name="camera-outline" size={21} color={colors.deepGreen} />
          <Text style={styles.uploadText}>Ajouter un justificatif</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity activeOpacity={0.85} style={styles.addLine}>
        <Ionicons name="add-outline" size={20} color={colors.deepGreen} />
        <Text style={styles.addLineText}>Ajouter une dépense</Text>
      </TouchableOpacity>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Montant estimé</Text>
        <Text style={styles.totalValue}>{estimatedAmount.toFixed(2)} €</Text>
      </View>

      <PrimaryButton>Soumettre la note</PrimaryButton>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  heading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  copy: {
    color: colors.mutedText,
    fontSize: 14,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    color: colors.text,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    fontSize: 14,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextActive: {
    color: colors.deepGreen,
  },
  upload: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
    padding: spacing.md,
  },
  uploadText: {
    color: colors.deepGreen,
    fontWeight: '800',
  },
  addLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  addLineText: {
    color: colors.deepGreen,
    fontWeight: '800',
  },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  totalLabel: {
    color: colors.mutedText,
    fontSize: 14,
  },
  totalValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
})

import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PrimaryButton } from '../components/PrimaryButton'
import { SectionTitle } from '../components/SectionTitle'
import { colors, radius, shadow, spacing } from '../theme/theme'

type DashboardScreenProps = {
  onNewReportPress: () => void
}

export function DashboardScreen({ onNewReportPress }: DashboardScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Espace membre</Text>
        <Text style={styles.heading}>Mes notes de frais</Text>
        <Text style={styles.copy}>Suivez vos demandes et préparez vos remboursements.</Text>
        <PrimaryButton onPress={onNewReportPress}>+ Nouvelle NDF</PrimaryButton>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metricCard}>
          <Ionicons name="time-outline" size={20} color={colors.warning} />
          <Text style={styles.metricValue}>0</Text>
          <Text style={styles.metricLabel}>En attente</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
          <Text style={styles.metricValue}>0</Text>
          <Text style={styles.metricLabel}>Traitées</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="wallet-outline" size={20} color={colors.blue} />
          <Text style={styles.metricValue}>0 €</Text>
          <Text style={styles.metricLabel}>Total</Text>
        </View>
      </View>

      <SectionTitle>Demandes récentes</SectionTitle>
      <View style={styles.emptyCard}>
        <View style={styles.emptyIcon}>
          <Ionicons name="document-text-outline" size={28} color={colors.green} />
        </View>
        <Text style={styles.emptyTitle}>Aucune note de frais</Text>
        <Text style={styles.emptyText}>Les demandes envoyées apparaîtront ici.</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow,
  },
  eyebrow: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  copy: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  metrics: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  metricValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  metricLabel: {
    color: colors.mutedText,
    fontSize: 11,
    marginTop: 2,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: 13,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
})

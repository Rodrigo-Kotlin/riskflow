import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { LABELS_CARACTERISTICAS } from '@/constants/labels'
import { Levantamento } from '@/types'
import { formatDate } from '@/lib/utils'

const brand = '#0B6B3A'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },
  header: {
    textAlign: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: brand,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: brand,
  },
  headerSubtitle: {
    fontSize: 9,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: brand,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  label: {
    width: 140,
    color: '#666',
  },
  value: {
    flex: 1,
    fontWeight: 'medium',
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  tableHeadCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#666',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCell: {
    fontSize: 9,
  },
  colPerigo: { width: '22%' },
  colCategoria: { width: '18%' },
  colScore: { width: '10%', textAlign: 'center' },
  colNivel: { width: '14%', textAlign: 'center' },
  colControle: { width: '36%' },
  parecerText: {
    fontSize: 10,
    lineHeight: 1.5,
    marginTop: 4,
  },
  signatureBox: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 8,
  },
  signatureLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  signatureText: {
    fontSize: 9,
    color: '#444',
    marginBottom: 2,
  },
  footer: {
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
})

interface ReportDocumentProps {
  levantamento: Levantamento
}

export default function ReportDocument({ levantamento }: ReportDocumentProps) {
  const l = levantamento

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Efetiva RiskFlow — LPR/AEP Digital</Text>
          <Text style={styles.headerSubtitle}>Levantamento de Perigos e Riscos / Análise Ergonômica Preliminar</Text>
        </View>

        <Text style={styles.sectionTitle}>Identificação</Text>
        <View style={styles.row}><Text style={styles.label}>Empresa:</Text><Text style={styles.value}>{l.empresaNome}</Text></View>
        <View style={styles.row}><Text style={styles.label}>CNPJ:</Text><Text style={styles.value}>{l.cnpj}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Setor:</Text><Text style={styles.value}>{l.setor}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Código:</Text><Text style={styles.value}>{l.codigo}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Tipo:</Text><Text style={styles.value}>{l.tipo}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Data:</Text><Text style={styles.value}>{formatDate(l.dataLevantamento)}</Text></View>

        <Text style={{ ...styles.sectionTitle, marginTop: 16 }}>Responsáveis</Text>
        <View style={styles.row}><Text style={styles.label}>Responsável Empresa:</Text><Text style={styles.value}>{l.responsavelEmpresa}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Auditor Técnico:</Text><Text style={styles.value}>{l.auditorTecnico}</Text></View>

        <Text style={{ ...styles.sectionTitle, marginTop: 16 }}>Características do Local</Text>
        {Object.entries(l.caracteristicas).filter(([k]) => k !== 'imagens' && k !== 'revestimento').map(([key, value]) => (
          <View key={key} style={styles.row}>
            <Text style={styles.label}>{LABELS_CARACTERISTICAS[key] ?? key}:</Text>
            <Text style={styles.value}>{String(value) || '-'}</Text>
          </View>
        ))}

        {l.medicoes.length > 0 && (
          <>
            <Text style={{ ...styles.sectionTitle, marginTop: 16 }}>Medições Pontuais</Text>
            <View style={styles.tableHead}>
              <Text style={{ ...styles.tableHeadCell, width: '30%' }}>Posto</Text>
              <Text style={{ ...styles.tableHeadCell, width: '17%' }}>Ruído dB(A)</Text>
              <Text style={{ ...styles.tableHeadCell, width: '20%' }}>Iluminância lux</Text>
              <Text style={{ ...styles.tableHeadCell, width: '17%' }}>Temperatura</Text>
              <Text style={{ ...styles.tableHeadCell, width: '16%' }}>Umidade</Text>
            </View>
            {l.medicoes.map((m) => (
              <View key={m.id} style={styles.tableRow}>
                <Text style={{ ...styles.tableCell, width: '30%' }}>{m.postoLocal}</Text>
                <Text style={{ ...styles.tableCell, width: '17%', textAlign: 'center' }}>{m.ruidoDbA}</Text>
                <Text style={{ ...styles.tableCell, width: '20%', textAlign: 'center' }}>{m.iluminanciaLux}</Text>
                <Text style={{ ...styles.tableCell, width: '17%', textAlign: 'center' }}>{m.temperatura}°C</Text>
                <Text style={{ ...styles.tableCell, width: '16%', textAlign: 'center' }}>{m.umidade}%</Text>
              </View>
            ))}
          </>
        )}

        <Text style={{ ...styles.sectionTitle, marginTop: 16 }}>Inventário de Riscos</Text>
        <View style={styles.tableHead}>
          <Text style={{ ...styles.tableHeadCell, ...styles.colPerigo }}>Perigo</Text>
          <Text style={{ ...styles.tableHeadCell, ...styles.colCategoria }}>Categoria</Text>
          <Text style={{ ...styles.tableHeadCell, ...styles.colScore }}>Score</Text>
          <Text style={{ ...styles.tableHeadCell, ...styles.colNivel }}>Nível</Text>
          <Text style={{ ...styles.tableHeadCell, ...styles.colControle }}>Controle</Text>
        </View>
        {l.riscos.map((r) => (
          <View key={r.id} style={styles.tableRow}>
            <Text style={{ ...styles.tableCell, ...styles.colPerigo }}>{r.perigo}</Text>
            <Text style={{ ...styles.tableCell, ...styles.colCategoria }}>{r.categoria}</Text>
            <Text style={{ ...styles.tableCell, ...styles.colScore }}>{r.pontuacao}</Text>
            <Text style={{ ...styles.tableCell, ...styles.colNivel }}>{r.nivel}</Text>
            <Text style={{ ...styles.tableCell, ...styles.colControle }}>{r.controleFonte || r.controleTrajetoria || r.controleTrabalhador || '-'}</Text>
          </View>
        ))}

        {l.parecer.texto && (
          <>
            <Text style={{ ...styles.sectionTitle, marginTop: 16 }}>Parecer Técnico</Text>
            <Text style={styles.parecerText}>{l.parecer.texto}</Text>
          </>
        )}

        <Text style={styles.footer} fixed>
          <Text>Documento gerado pelo Efetiva RiskFlow — LPR/AEP Digital | </Text>
          <Text>Data de emissão: {formatDate(new Date().toISOString())} | </Text>
          <Text render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Página ${pageNumber} de ${totalPages}`} />
        </Text>
      </Page>
    </Document>
  )
}

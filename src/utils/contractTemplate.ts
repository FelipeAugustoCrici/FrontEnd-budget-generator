export interface ContractVariables {
  client_name: string
  client_company: string
  client_email: string
  contract_value: string
  start_date: string
  end_date: string
  service_description: string
  current_date: string
  company_name: string
}

export const DEFAULT_CONTRACT_TEMPLATE = `
<h1 style="text-align:center">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>

<p style="text-align:center"><strong>{{current_date}}</strong></p>

<p>Por este instrumento particular, as partes abaixo qualificadas celebram o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas e condições seguintes:</p>

<h2>1. DAS PARTES</h2>

<p><strong>CONTRATANTE:</strong> {{client_name}}, empresa {{client_company}}, e-mail {{client_email}}.</p>

<p><strong>CONTRATADA:</strong> {{company_name}}, doravante denominada simplesmente CONTRATADA.</p>

<h2>2. DO OBJETO</h2>

<p>O presente contrato tem por objeto a prestação dos seguintes serviços:</p>

<p>{{service_description}}</p>

<h2>3. DO PRAZO</h2>

<p>O presente contrato terá vigência de <strong>{{start_date}}</strong> a <strong>{{end_date}}</strong>, podendo ser renovado mediante acordo entre as partes.</p>

<h2>4. DO VALOR E FORMA DE PAGAMENTO</h2>

<p>Pelos serviços prestados, a CONTRATANTE pagará à CONTRATADA o valor de <strong>{{contract_value}}</strong>.</p>

<p>O pagamento será realizado conforme acordado entre as partes.</p>

<h2>5. DAS OBRIGAÇÕES DA CONTRATADA</h2>

<p>A CONTRATADA obriga-se a:</p>
<ul>
  <li>Executar os serviços descritos no objeto deste contrato com qualidade e dentro dos prazos acordados;</li>
  <li>Manter sigilo sobre todas as informações confidenciais da CONTRATANTE;</li>
  <li>Comunicar imediatamente qualquer impedimento na execução dos serviços.</li>
</ul>

<h2>6. DAS OBRIGAÇÕES DA CONTRATANTE</h2>

<p>A CONTRATANTE obriga-se a:</p>
<ul>
  <li>Efetuar os pagamentos nas datas acordadas;</li>
  <li>Fornecer as informações e materiais necessários para a execução dos serviços;</li>
  <li>Comunicar à CONTRATADA qualquer alteração no escopo dos serviços.</li>
</ul>

<h2>7. DA RESCISÃO</h2>

<p>O presente contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de 30 (trinta) dias, por escrito.</p>

<h2>8. DO FORO</h2>

<p>As partes elegem o foro da comarca de sua cidade para dirimir quaisquer dúvidas oriundas do presente contrato.</p>

<p>E por estarem assim justas e contratadas, as partes assinam o presente instrumento em duas vias de igual teor.</p>

<br/>
<br/>

<table style="width:100%; border-collapse:collapse;">
  <tr>
    <td style="width:50%; padding-right:24px; vertical-align:top;">
      <p>___________________________________</p>
      <p><strong>CONTRATANTE</strong></p>
      <p>{{client_name}}</p>
    </td>
    <td style="width:50%; padding-left:24px; vertical-align:top;">
      <p>___________________________________</p>
      <p><strong>CONTRATADA</strong></p>
      <p>{{company_name}}</p>
    </td>
  </tr>
</table>
`

export function replaceTemplateVariables(template: string, data: Partial<ContractVariables>): string {
  return Object.entries(data).reduce((result, [key, value]) => {
    return result.split(`{{${key}}}`).join(value ?? '')
  }, template)
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(date?: string): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pt-BR')
}

export const VARIABLE_LABELS: Record<keyof ContractVariables, string> = {
  client_name: 'Nome do cliente',
  client_company: 'Empresa do cliente',
  client_email: 'E-mail do cliente',
  contract_value: 'Valor do contrato',
  start_date: 'Data de início',
  end_date: 'Data de término',
  service_description: 'Descrição do serviço',
  current_date: 'Data atual',
  company_name: 'Sua empresa',
}

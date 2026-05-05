import './ThermalReceipt.css';

interface ThermalReceiptProps {
  company: any;
  order: any;
  items: any[];
}

export default function ThermalReceipt({ company, order, items }: ThermalReceiptProps) {
  const total = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  return (
    <div className="receipt-container">
      <div className="receipt-header">
        <h2>{company.razaoSocial || 'NFERIO ERP'}</h2>
        <p>{company.cnpj || '00.000.000/0001-00'}</p>
        <p>{company.logradouro}, {company.numero}</p>
        <p>{company.municipio} - {company.uf}</p>
      </div>

      <div className="receipt-body">
        <p><strong>CUPOM NÃO FISCAL</strong></p>
        <p>Data: {new Date().toLocaleString('pt-BR')}</p>
        <p>Pedido: #{order?.orderNumber || '0000'}</p>
        
        <table className="receipt-table">
          <thead>
            <tr>
              <th>ITEM</th>
              <th style={{ textAlign: 'right' }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td>
                  {item.name}<br/>
                  <small>{item.quantity} {item.unit} x {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</small>
                </td>
                <td style={{ textAlign: 'right', verticalAlign: 'bottom' }}>
                  {(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="receipt-footer">
        <div className="footer-row">
          <span>SUBTOTAL:</span>
          <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
        <div className="footer-row total">
          <span>TOTAL:</span>
          <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
        
        <div className="receipt-msg">
          <p>Obrigado pela preferência!</p>
          <p>www.nferio.com.br</p>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Calculator as CalcIcon, Home, Key, TrendingUp, BarChart3, Info, Percent, Calendar, ShieldCheck } from 'lucide-react';

const Calculator = () => {
  // --- BUY INPUTS ---
  const [price, setPrice] = useState(300000);
  const [apport, setApport] = useState(50000); // New: Apport personnel
  const [notaryRate, setNotaryRate] = useState(7.5);
  const [loanDuration, setLoanDuration] = useState(25);
  const [interestRate, setInterestRate] = useState(3.5);
  const [insuranceRate, setInsuranceRate] = useState(0.36); // Assurance emprunteur
  const [homeInsurance, setHomeInsurance] = useState(350); // Assurance habitation annelle
  const [propertyTax, setPropertyTax] = useState(1200);
  const [propertyTaxIncrease, setPropertyTaxIncrease] = useState(3); // New: Property tax annual increase
  const [condoFees, setCondoFees] = useState(150); // monthly
  const [maintenanceRate, setMaintenanceRate] = useState(1.5);
  const [resaleAgencyRate, setResaleAgencyRate] = useState(5);
  const [appreciationRate, setAppreciationRate] = useState(1.5); // Property appreciation per year

  // --- RENT INPUTS ---
  const [rentPrice, setRentPrice] = useState(1200);
  const [rentIncrease, setRentIncrease] = useState(2); // Inflation/Indexation des loyers
  const [investmentReturn, setInvestmentReturn] = useState(4); // Placement de l'apport
  
  // --- GLOBAL ---
  const [years, setYears] = useState(10); 

  // Results
  const [results, setResults] = useState({
    buyTotalSpent: 0,
    rentTotalSpent: 0,
    buyEquity: 0,
    rentEquity: 0,
    buyNetPosition: 0,
    rentNetPosition: 0,
    isBuyingBetter: false,
    loanAmount: 0
  });

  useEffect(() => {
    calculate();
  }, [price, apport, notaryRate, loanDuration, interestRate, insuranceRate, homeInsurance, propertyTax, propertyTaxIncrease, condoFees, maintenanceRate, resaleAgencyRate, appreciationRate, rentPrice, rentIncrease, investmentReturn, years]);

  const calculate = () => {
    // 1. BUYING CALCULATIONS
    const notaryFees = price * (notaryRate / 100);
    
    // Loan logic: Apport covers notary fees first, the rest reduces the price.
    // If apport < notary fees, we assume the loan covers the rest (not common but possible in some scenarios, 
    // but here we'll assume loan = price - (apport - notaryFees)).
    const cashUsedForPrice = Math.max(0, apport - notaryFees);
    const loanAmount = Math.max(0, price - cashUsedForPrice);
    
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanDuration * 12;
    const monthlyMortgage = loanAmount > 0 
      ? (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numPayments))
      : 0;
    const monthlyLoanInsurance = (loanAmount * (insuranceRate / 100)) / 12;
    
    let buySpentAccumulated = notaryFees + cashUsedForPrice; // Initial cash outflow
    let currentLoanBalance = loanAmount;
    let simulatedPrice = price;
    let currentPropertyTax = propertyTax;

    for (let y = 1; y <= years; y++) {
      // Annual costs
      buySpentAccumulated += homeInsurance + currentPropertyTax + (simulatedPrice * (maintenanceRate / 100));
      
      for (let m = 1; m <= 12; m++) {
        const totalMonths = (y - 1) * 12 + m;
        if (totalMonths <= numPayments) {
          const interestPayment = currentLoanBalance * monthlyRate;
          const principalPayment = monthlyMortgage - interestPayment;
          currentLoanBalance -= principalPayment;
          buySpentAccumulated += interestPayment + monthlyLoanInsurance;
        }
        buySpentAccumulated += condoFees;
      }
      simulatedPrice *= (1 + (appreciationRate / 100));
      currentPropertyTax *= (1 + (propertyTaxIncrease / 100)); // Apply increase
    }

    const sellingFees = simulatedPrice * (resaleAgencyRate / 100);
    const buyFinalEquity = simulatedPrice - currentLoanBalance - sellingFees;
    const buyNetPosition = buyFinalEquity - buySpentAccumulated;

    // 2. RENTING CALCULATIONS
    let rentSpentAccumulated = 0;
    let investedCapital = apport; // The whole apport is invested if renting
    let currentRent = rentPrice;

    for (let y = 1; y <= years; y++) {
      for (let m = 1; m <= 12; m++) {
        rentSpentAccumulated += currentRent;
        investedCapital *= (1 + (investmentReturn / 100 / 12));
      }
      currentRent *= (1 + (rentIncrease / 100));
    }
    
    const rentNetPosition = investedCapital - rentSpentAccumulated;

    setResults({
      buyTotalSpent: buySpentAccumulated,
      rentTotalSpent: rentSpentAccumulated,
      buyEquity: buyFinalEquity,
      rentEquity: investedCapital,
      buyNetPosition,
      rentNetPosition,
      isBuyingBetter: buyNetPosition > rentNetPosition,
      loanAmount
    });
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid">
      {/* Inputs Column */}
      <div className="card glass" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.25rem' }}>
          <CalcIcon size={20} className="text-primary" /> Configuration du projet
        </h2>
        
        <div className="input-group">
          <label style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Prix du bien immobilier</span>
            <span style={{ color: '#fff' }}>{formatCurrency(price)}</span>
          </label>
          <input type="range" min="50000" max="1500000" step="10000" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="input-control" />
        </div>

        <div className="input-group">
          <label style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Apport personnel</span>
            <span style={{ color: '#fff' }}>{formatCurrency(apport)}</span>
          </label>
          <input type="range" min="0" max={price} step="5000" value={apport} onChange={(e) => setApport(Number(e.target.value))} className="input-control" />
        </div>

        <div className="input-group">
          <label style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Simulation sur {years} ans</span>
            <span style={{ color: '#fff' }}>{years} ans</span>
          </label>
          <input type="range" min="1" max="40" step="1" value={years} onChange={(e) => setYears(Number(e.target.value))} className="input-control" />
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Notaire (%)</label>
            <input type="number" step="0.1" value={notaryRate} onChange={(e) => setNotaryRate(Number(e.target.value))} className="input-control" />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
             <label>Emprunt ({formatCurrency(results.loanAmount)})</label>
             <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', opacity: 0.7 }}>
               Calculé auto
             </div>
          </div>
        </div>

        <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Percent size={16} /> Financement & Assurance
          </h3>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Taux Crédit (%)</label>
              <input type="number" step="0.05" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="input-control" />
            </div>
            <div className="input-group">
              <label>Assur. Prêt (%)</label>
              <input type="number" step="0.01" value={insuranceRate} onChange={(e) => setInsuranceRate(Number(e.target.value))} className="input-control" />
            </div>
            <div className="input-group">
              <label>Durée (ans)</label>
              <input type="number" value={loanDuration} onChange={(e) => setLoanDuration(Number(e.target.value))} className="input-control" />
            </div>
            <div className="input-group">
              <label>Assur. Hab. (€/an)</label>
              <input type="number" value={homeInsurance} onChange={(e) => setHomeInsurance(Number(e.target.value))} className="input-control" />
            </div>
          </div>
        </div>

        <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Home size={16} /> Charges & Entretien
          </h3>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Taxe Foncière (€)</label>
              <input type="number" value={propertyTax} onChange={(e) => setPropertyTax(Number(e.target.value))} className="input-control" />
            </div>
            <div className="input-group">
              <label>Hausse Taxe (%/an)</label>
              <input type="number" step="0.1" value={propertyTaxIncrease} onChange={(e) => setPropertyTaxIncrease(Number(e.target.value))} className="input-control" />
            </div>
            <div className="input-group">
              <label>Copro (€/mois)</label>
              <input type="number" value={condoFees} onChange={(e) => setCondoFees(Number(e.target.value))} className="input-control" />
            </div>
            <div className="input-group">
              <label>Entretien (%/an)</label>
              <input type="number" step="0.1" value={maintenanceRate} onChange={(e) => setMaintenanceRate(Number(e.target.value))} className="input-control" />
            </div>
            <div className="input-group">
              <label>Revente (% frais)</label>
              <input type="number" step="0.5" value={resaleAgencyRate} onChange={(e) => setResaleAgencyRate(Number(e.target.value))} className="input-control" />
            </div>
          </div>
        </div>

        <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
          <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Calendar size={16} /> Alternative Location
          </h3>
          <div className="input-group">
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Loyer mensuel</span>
              <span style={{ color: '#fff' }}>{formatCurrency(rentPrice)}</span>
            </label>
            <input type="range" min="300" max="4000" step="50" value={rentPrice} onChange={(e) => setRentPrice(Number(e.target.value))} className="input-control" />
          </div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Infla. Loyer (%)</label>
              <input type="number" step="0.1" value={rentIncrease} onChange={(e) => setRentIncrease(Number(e.target.value))} className="input-control" />
            </div>
            <div className="input-group">
              <label>Rendement Apport (%)</label>
              <input type="number" step="0.1" value={investmentReturn} onChange={(e) => setInvestmentReturn(Number(e.target.value))} className="input-control" />
            </div>
          </div>
        </div>
      </div>

      {/* Results Column */}
      <div className="card glass" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem', height: 'fit-content' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.25rem' }}>
          <BarChart3 size={20} className="text-primary" /> Bilan patrimonial
        </h2>

        <div className={`stat-card ${results.isBuyingBetter ? 'success' : 'danger'}`} style={{ 
          border: '1px solid', 
          borderColor: results.isBuyingBetter ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
          background: results.isBuyingBetter ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
          padding: '2rem'
        }}>
          <div className="stat-label">Décision optimisée</div>
          <div className="stat-value" style={{ 
            color: results.isBuyingBetter ? '#10b981' : '#ef4444',
            fontSize: '2.5rem',
            letterSpacing: '-1px'
          }}>
            {results.isBuyingBetter ? 'ACHETER' : 'LOUER'}
          </div>
          <div style={{ marginTop: '0.5rem', opacity: 0.8 }}>
            Différence : <span style={{ fontWeight: 700 }}>{formatCurrency(Math.abs(results.buyNetPosition - results.rentNetPosition))}</span>
          </div>
        </div>

        {/* Visual Comparison Bars */}
        <div style={{ marginTop: '1rem' }}>
           <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span>Patrimoine net (Achat)</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(results.buyNetPosition)}</span>
              </div>
              <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.max(10, (results.buyNetPosition / Math.max(results.buyNetPosition, results.rentNetPosition)) * 100)}%`, 
                  height: '100%', 
                  background: 'var(--primary)',
                  transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
              </div>
           </div>

           <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span>Patrimoine net (Location)</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(results.rentNetPosition)}</span>
              </div>
              <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.max(10, (results.rentNetPosition / Math.max(results.buyNetPosition, results.rentNetPosition)) * 100)}%`, 
                  height: '100%', 
                  background: 'var(--secondary)',
                  transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
              </div>
           </div>
        </div>

        <div className="glass" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', marginTop: '1rem' }}>
          <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', color: 'var(--text-muted)' }}>Récapitulatif Achat</h3>
          <ul style={{ listStyle: 'none', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span>Dépenses cumulées:</span> <span style={{ color: '#fff' }}>{formatCurrency(results.buyTotalSpent)}</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span>Valeur estimée du bien:</span> <span style={{ color: '#fff' }}>{formatCurrency(price * Math.pow(1 + appreciationRate/100, years))}</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Capital remboursé:</span> <span style={{ color: '#fff' }}>{formatCurrency(results.buyEquity)}</span>
            </li>
          </ul>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.1)', color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: '1.4' }}>
          <Info size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
          <p>Le patrimoine net correspond à la valeur finale (bien revendu ou capital placé) moins toutes les sommes dépensées durant {years} ans.</p>
        </div>
      </div>
    </div>
  );
};

export default Calculator;

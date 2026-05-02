import React, { useState, useEffect } from 'react';
import { Calculator as CalcIcon, Home, Key, TrendingUp, BarChart3, Info, Percent, Calendar, ShieldCheck } from 'lucide-react';

const Calculator = () => {
  // --- BUY INPUTS ---
  const [price, setPrice] = useState(300000);
  const [apport, setApport] = useState(50000);
  const [notaryRate, setNotaryRate] = useState(7.5);
  const [loanDuration, setLoanDuration] = useState(25);
  const [interestRate, setInterestRate] = useState(3.5);
  const [insuranceRate, setInsuranceRate] = useState(0.36);
  const [homeInsurance, setHomeInsurance] = useState(350);
  const [propertyTax, setPropertyTax] = useState(1200);
  const [propertyTaxIncrease, setPropertyTaxIncrease] = useState(3);
  const [condoFees, setCondoFees] = useState(150);
  const [maintenanceRate, setMaintenanceRate] = useState(1.5);
  const [resaleAgencyRate, setResaleAgencyRate] = useState(5);
  const [appreciationRate, setAppreciationRate] = useState(1.5);

  // --- RENT INPUTS ---
  const [rentPrice, setRentPrice] = useState(1200);
  const [rentIncrease, setRentIncrease] = useState(2);
  const [investmentReturn, setInvestmentReturn] = useState(4);
  
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
    loanAmount: 0,
    breakdown: {
      buy: { interest: 0, insurance: 0, tax: 0, condo: 0, maintenance: 0, notary: 0, resale: 0, appreciation: 0, savingsInterest: 0 },
      rent: { totalRent: 0, capitalGrowth: 0, savingsInterest: 0 }
    }
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('acheter-louer-data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.price) setPrice(data.price);
        if (data.apport !== undefined) setApport(data.apport);
        if (data.notaryRate) setNotaryRate(data.notaryRate);
        if (data.loanDuration) setLoanDuration(data.loanDuration);
        if (data.interestRate) setInterestRate(data.interestRate);
        if (data.insuranceRate) setInsuranceRate(data.insuranceRate);
        if (data.homeInsurance) setHomeInsurance(data.homeInsurance);
        if (data.propertyTax) setPropertyTax(data.propertyTax);
        if (data.propertyTaxIncrease) setPropertyTaxIncrease(data.propertyTaxIncrease);
        if (data.condoFees) setCondoFees(data.condoFees);
        if (data.maintenanceRate) setMaintenanceRate(data.maintenanceRate);
        if (data.resaleAgencyRate) setResaleAgencyRate(data.resaleAgencyRate);
        if (data.appreciationRate) setAppreciationRate(data.appreciationRate);
        if (data.rentPrice) setRentPrice(data.rentPrice);
        if (data.rentIncrease) setRentIncrease(data.rentIncrease);
        if (data.investmentReturn) setInvestmentReturn(data.investmentReturn);
        if (data.years) setYears(data.years);
      } catch (e) {
        console.error('Failed to load saved data', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const data = {
      price, apport, notaryRate, loanDuration, interestRate, insuranceRate, 
      homeInsurance, propertyTax, propertyTaxIncrease, condoFees, 
      maintenanceRate, resaleAgencyRate, appreciationRate, 
      rentPrice, rentIncrease, investmentReturn, years
    };
    localStorage.setItem('acheter-louer-data', JSON.stringify(data));
    calculate();
  }, [price, apport, notaryRate, loanDuration, interestRate, insuranceRate, homeInsurance, propertyTax, propertyTaxIncrease, condoFees, maintenanceRate, resaleAgencyRate, appreciationRate, rentPrice, rentIncrease, investmentReturn, years]);

  const calculate = () => {
    // 1. BUYING CALCULATIONS
    const notaryFees = price * (notaryRate / 100);
    const cashUsedForPrice = Math.max(0, apport - notaryFees);
    const loanAmount = Math.max(0, price - cashUsedForPrice);
    
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanDuration * 12;
    const monthlyMortgage = loanAmount > 0 
      ? (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numPayments))
      : 0;
    const monthlyLoanInsurance = (loanAmount * (insuranceRate / 100)) / 12;
    
    let buySpentAccumulated = notaryFees + cashUsedForPrice; 
    let currentLoanBalance = loanAmount;
    let simulatedPrice = price;
    let currentPropertyTax = propertyTax;
    let buyInvestedDifference = 0; 
    
    const buyBreakdown = {
      interest: 0,
      insurance: 0,
      tax: 0,
      condo: 0,
      maintenance: 0,
      notary: notaryFees,
      resale: 0,
      appreciation: 0,
      savingsCapital: 0,
      savingsInterest: 0
    };

    // 2. RENTING CALCULATIONS
    let rentSpentAccumulated = 0;
    let renterInvestedCapital = apport; 
    let currentRent = rentPrice;
    
    const rentBreakdown = {
      totalRent: 0,
      capitalGrowth: 0,
      savingsCapital: 0,
      savingsInterest: 0
    };

    for (let y = 1; y <= years; y++) {
      const annualHomeInsurance = homeInsurance;
      const annualMaintenance = simulatedPrice * (maintenanceRate / 100);
      
      for (let m = 1; m <= 12; m++) {
        const totalMonths = (y - 1) * 12 + m;
        
        // --- Monthly Buy Costs ---
        let monthlyBuyOutflow = condoFees + (currentPropertyTax / 12) + (annualHomeInsurance / 12) + (annualMaintenance / 12);
        buyBreakdown.condo += condoFees;
        buyBreakdown.tax += currentPropertyTax / 12;
        buyBreakdown.maintenance += annualMaintenance / 12;
        buyBreakdown.insurance += annualHomeInsurance / 12;

        if (totalMonths <= numPayments) {
          const interestPayment = currentLoanBalance * monthlyRate;
          const principalPayment = monthlyMortgage - interestPayment;
          currentLoanBalance -= principalPayment;
          monthlyBuyOutflow += monthlyMortgage + monthlyLoanInsurance;
          
          buyBreakdown.interest += interestPayment;
          buyBreakdown.insurance += monthlyLoanInsurance;
        }
        buySpentAccumulated += monthlyBuyOutflow;

        // --- Monthly Rent Costs ---
        const monthlyRentOutflow = currentRent;
        rentSpentAccumulated += monthlyRentOutflow;
        rentBreakdown.totalRent += monthlyRentOutflow;

        // --- Opportunity Cost Logic ---
        if (monthlyBuyOutflow > monthlyRentOutflow) {
          const diff = monthlyBuyOutflow - monthlyRentOutflow;
          const prevCapital = renterInvestedCapital;
          renterInvestedCapital += diff;
          rentBreakdown.savingsCapital += diff;
          renterInvestedCapital *= (1 + (investmentReturn / 100 / 12));
          rentBreakdown.savingsInterest += (renterInvestedCapital - prevCapital - diff);
        } else {
          const diff = monthlyRentOutflow - monthlyBuyOutflow;
          const prevInv = buyInvestedDifference;
          buyInvestedDifference += diff;
          buyBreakdown.savingsCapital += diff;
          buyInvestedDifference *= (1 + (investmentReturn / 100 / 12));
          buyBreakdown.savingsInterest += (buyInvestedDifference - prevInv - diff);
        }
      }
      
      simulatedPrice *= (1 + (appreciationRate / 100));
      currentPropertyTax *= (1 + (propertyTaxIncrease / 100));
      currentRent *= (1 + (rentIncrease / 100));
    }

    const sellingFees = simulatedPrice * (resaleAgencyRate / 100);
    buyBreakdown.resale = sellingFees;
    buyBreakdown.appreciation = simulatedPrice - price;
    
    const initialApportGrowth = apport * (Math.pow(1 + investmentReturn/100, years) - 1);
    rentBreakdown.capitalGrowth = initialApportGrowth;

    const buyFinalEquity = simulatedPrice - currentLoanBalance - sellingFees;
    const buyFinalWealth = buyFinalEquity + buyInvestedDifference;
    const rentFinalWealth = renterInvestedCapital;

    setResults({
      buyTotalSpent: buySpentAccumulated,
      rentTotalSpent: rentSpentAccumulated,
      buyEquity: buyFinalEquity,
      rentEquity: renterInvestedCapital,
      buyNetPosition: buyFinalWealth,
      rentNetPosition: rentFinalWealth,
      isBuyingBetter: buyFinalWealth > rentFinalWealth,
      loanAmount,
      breakdown: { buy: buyBreakdown, rent: rentBreakdown }
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
          <input type="range" min="50000" max="1500000" step="5000" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="input-control" />
        </div>

        <div className="input-group">
          <label style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Apport personnel</span>
            <span style={{ color: '#fff' }}>{formatCurrency(apport)}</span>
          </label>
          <input type="range" min="0" max={price} step="5000" value={apport} onChange={(e) => setApport(Number(e.target.value))} className="input-control" />
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
              <label>Placement (%)</label>
              <input type="number" step="0.1" value={investmentReturn} onChange={(e) => setInvestmentReturn(Number(e.target.value))} className="input-control" />
            </div>
          </div>
        </div>
      </div>

      {/* Results Column */}
      <div className="card glass" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem', height: 'fit-content', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.25rem' }}>
          <BarChart3 size={20} className="text-primary" /> Bilan Patrimonial après {years} ans
        </h2>

        <div className="input-group" style={{ marginBottom: 0, padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            <span>Durée de la simulation</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>{years} ans</span>
          </label>
          <input type="range" min="1" max="40" step="1" value={years} onChange={(e) => setYears(Number(e.target.value))} className="input-control" />
        </div>

        <div className={`stat-card ${results.isBuyingBetter ? 'success' : 'danger'}`} style={{ 
          border: '1px solid', 
          borderColor: results.isBuyingBetter ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
          background: results.isBuyingBetter ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
          padding: '2rem'
        }}>
          <div className="stat-label">Valeur Nette du Patrimoine</div>
          <div className="stat-value" style={{ 
            color: results.isBuyingBetter ? '#10b981' : '#ef4444',
            fontSize: '2.5rem',
            letterSpacing: '-1px'
          }}>
            {results.isBuyingBetter ? 'ACHETER' : 'LOUER'}
          </div>
          <div style={{ marginTop: '0.5rem', opacity: 0.8 }}>
            Avantage : <span style={{ fontWeight: 700 }}>{formatCurrency(Math.abs(results.buyNetPosition - results.rentNetPosition))}</span>
          </div>
        </div>

        {/* Comparison Bars */}
        <div style={{ marginTop: '0.5rem' }}>
           <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Patrimoine Final (Achat)</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(results.buyNetPosition)}</span>
              </div>
              <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.max(5, (results.buyNetPosition / Math.max(results.buyNetPosition, results.rentNetPosition)) * 100)}%`, 
                  height: '100%', 
                  background: 'var(--primary)',
                  transition: 'width 0.5s'
                }} />
              </div>
           </div>

           <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Patrimoine Final (Location)</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(results.rentNetPosition)}</span>
              </div>
              <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.max(5, (results.rentNetPosition / Math.max(results.buyNetPosition, results.rentNetPosition)) * 100)}%`, 
                  height: '100%', 
                  background: 'var(--secondary)',
                  transition: 'width 0.5s'
                }} />
              </div>
           </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="glass" style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)' }}>
            <h3 style={{ fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Total Dépensé</h3>
            <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>{formatCurrency(results.buyTotalSpent)}</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Achat</div>
          </div>
          <div className="glass" style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)' }}>
            <h3 style={{ fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Total Dépensé</h3>
            <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>{formatCurrency(results.rentTotalSpent)}</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Location</div>
          </div>
        </div>

        {/* Detailed Breakdown Section */}
        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} className="text-primary" /> Détails financiers sur {years} ans
          </h3>
          
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Buying Details */}
            <div>
              <h4 style={{ fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.5px' }}>Détails Achat</h4>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>SOMMES DÉPENSÉES (PERDUES)</p>
                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Frais Notaire:</span> <span>{formatCurrency(results.breakdown.buy.notary)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Intérêts Prêt:</span> <span>{formatCurrency(results.breakdown.buy.interest)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Assurances:</span> <span>{formatCurrency(results.breakdown.buy.insurance)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Taxes Foncières:</span> <span>{formatCurrency(results.breakdown.buy.tax)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Charges Copro:</span> <span>{formatCurrency(results.breakdown.buy.condo)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Entretien:</span> <span>{formatCurrency(results.breakdown.buy.maintenance)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Frais Revente:</span> <span>{formatCurrency(results.breakdown.buy.resale)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontWeight: 600 }}>
                    <span>TOTAL DÉPENSÉ:</span> <span>{formatCurrency(results.breakdown.buy.notary + results.breakdown.buy.interest + results.breakdown.buy.insurance + results.breakdown.buy.tax + results.breakdown.buy.condo + results.breakdown.buy.maintenance + results.breakdown.buy.resale)}</span>
                  </div>
                </div>
              </div>

              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>GAINS ET PATRIMOINE</p>
                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Plus-value Bien:</span> <span style={{ color: '#10b981' }}>+{formatCurrency(results.breakdown.buy.appreciation)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Capital Épargné:</span> <span>+{formatCurrency(results.breakdown.buy.savingsCapital)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Intérêts Épargne:</span> <span style={{ color: '#10b981' }}>+{formatCurrency(results.breakdown.buy.savingsInterest)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontWeight: 600 }}>
                    <span>PATRIMOINE FINAL:</span> <span style={{ color: 'var(--primary)' }}>{formatCurrency(results.buyNetPosition)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Renting Details */}
            <div>
              <h4 style={{ fontSize: '0.75rem', color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.5px' }}>Détails Location</h4>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>SOMMES DÉPENSÉES (PERDUES)</p>
                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Loyers Totaux:</span> <span>{formatCurrency(results.breakdown.rent.totalRent)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontWeight: 600 }}>
                    <span>TOTAL DÉPENSÉ:</span> <span>{formatCurrency(results.breakdown.rent.totalRent)}</span>
                  </div>
                </div>
              </div>

              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>GAINS ET PATRIMOINE</p>
                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Apport Initial:</span> <span>{formatCurrency(apport)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Plus-value Apport:</span> <span style={{ color: '#10b981' }}>+{formatCurrency(results.breakdown.rent.capitalGrowth)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Capital Épargné:</span> <span>+{formatCurrency(results.breakdown.rent.savingsCapital)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Intérêts Épargne:</span> <span style={{ color: '#10b981' }}>+{formatCurrency(results.breakdown.rent.savingsInterest)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontWeight: 600 }}>
                    <span>PATRIMOINE FINAL:</span> <span style={{ color: 'var(--secondary)' }}>{formatCurrency(results.rentNetPosition)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.1)', color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: '1.4' }}>
          <Info size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
          <p>Le <strong>Patrimoine Final</strong> inclut la valeur du bien (après revente) ou le capital placé, <strong>plus</strong> les intérêts générés par le placement de l'économie mensuelle (coût d'opportunité).</p>
        </div>
      </div>
    </div>
  );
};

export default Calculator;

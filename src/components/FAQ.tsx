import React, { useState } from 'react';
import { ChevronDown, HelpCircle, AlertTriangle, TrendingDown, PiggyBank } from 'lucide-react';

const FAQItem = ({ question, answer, icon: Icon }: { question: string; answer: React.ReactNode; icon: any }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="card glass" style={{ marginBottom: '1rem', padding: 0, overflow: 'hidden' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          color: 'inherit'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            padding: '0.5rem', 
            background: 'rgba(37, 99, 235, 0.1)', 
            borderRadius: '0.5rem',
            color: 'var(--primary)'
          }}>
            <Icon size={20} />
          </div>
          <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{question}</span>
        </div>
        <ChevronDown 
          size={20} 
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', 
            transition: 'transform 0.3s ease',
            opacity: 0.5
          }} 
        />
      </button>
      
      <div style={{ 
        maxHeight: isOpen ? '500px' : '0', 
        overflow: 'hidden', 
        transition: 'max-height 0.3s ease-in-out'
      }}>
        <div style={{ padding: '0 1.5rem 1.5rem 4.5rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          {answer}
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  return (
    <section id="faq" style={{ marginTop: '4rem', maxWidth: '900px', margin: '4rem auto 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Comprendre les limites de la simulation</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Une simulation financière n'est pas une boule de cristal. Voici les nuances importantes à garder en tête.
        </p>
      </div>

      <FAQItem
        icon={TrendingDown}
        question="Que se passe-t-il en cas de crise financière ou immobilière ?"
        answer={
          <>
            <p>Le simulateur utilise des taux moyens constants (appréciation du bien et rendement des placements). En réalité, les marchés sont volatils :</p>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
              <li><strong>Immobilier :</strong> Une baisse des prix peut réduire votre patrimoine net à la revente, voire vous mettre en situation de "negative equity" si vous revendez trop tôt.</li>
              <li><strong>Bourse :</strong> Si votre placement chute de 20% au moment où vous vouliez acheter, votre capital de locataire fond.</li>
            </ul>
            <p style={{ marginTop: '0.5rem' }}><em>Conseil : Plus la durée du projet est longue, plus ces risques sont lissés par l'histoire.</em></p>
          </>
        }
      />

      <FAQItem
        icon={PiggyBank}
        question="Et si je n'investis pas la différence chaque mois ?"
        answer={
          <>
            <p>C'est la limite la plus critique pour les locataires. Le simulateur suppose que si louer coûte moins cher que posséder, vous placez **chaque euro économisé**.</p>
            <p style={{ marginTop: '0.5rem' }}>Si vous dépensez cette différence en loisirs ou consommation, la location perd son avantage financier majeur. Pour beaucoup, le remboursement d'un crédit est une "épargne forcée" que la location n'offre pas naturellement.</p>
          </>
        }
      />

      <FAQItem
        icon={AlertTriangle}
        question="Pourquoi les travaux sont-ils si impactants ?"
        answer={
          <>
            <p>Les économistes estiment que l'entretien d'un bien coûte entre 1% et 2% de sa valeur par an (chaudière, toiture, façade, rafraîchissement). Sur 20 ans, cela représente des sommes colossales.</p>
            <p style={{ marginTop: '0.5rem' }}>Négliger ces frais dans vos calculs rend l'achat artificiellement plus attractif qu'il ne l'est réellement.</p>
          </>
        }
      />

      <FAQItem
        icon={HelpCircle}
        question="La composante psychologique et la liberté"
        answer={
          <>
            <p>L'argent n'est pas tout. Être propriétaire offre une sécurité émotionnelle et la liberté de transformer son chez-soi.</p>
            <p style={{ marginTop: '0.5rem' }}>Être locataire offre une mobilité géographique et une liberté d'esprit (pas de gestion de copropriété ou de gros travaux). Ces éléments n'ont pas de prix affichable sur un graphique.</p>
          </>
        }
      />
    </section>
  );
};

export default FAQ;

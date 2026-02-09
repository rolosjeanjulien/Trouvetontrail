import { Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function MentionsLegales() {
  return (
    <div className="min-h-screen pt-24 pb-16" data-testid="mentions-legales-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>

        <Card className="p-8 bg-card border-border rounded-2xl">
          <h1 className="font-heading text-3xl font-bold mb-8">MENTIONS LÉGALES</h1>
          
          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">1. Éditeur du site</h2>
              <p className="text-muted-foreground">
                Le site <strong className="text-foreground">Trouve Ton Dossard</strong> est édité par :
              </p>
              <ul className="text-muted-foreground mt-2 space-y-1">
                <li><strong className="text-foreground">Nom / Raison sociale :</strong> [À compléter]</li>
                <li><strong className="text-foreground">Adresse :</strong> [À compléter]</li>
                <li><strong className="text-foreground">Téléphone :</strong> [À compléter]</li>
                <li><strong className="text-foreground">Email :</strong> [À compléter]</li>
                <li><strong className="text-foreground">SIRET :</strong> [À compléter]</li>
                <li><strong className="text-foreground">Directeur de la publication :</strong> [À compléter]</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">2. Hébergement</h2>
              <p className="text-muted-foreground">
                Le site est hébergé par :
              </p>
              <ul className="text-muted-foreground mt-2 space-y-1">
                <li><strong className="text-foreground">Hébergeur :</strong> [À compléter]</li>
                <li><strong className="text-foreground">Adresse :</strong> [À compléter]</li>
                <li><strong className="text-foreground">Téléphone :</strong> [À compléter]</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">3. Propriété intellectuelle</h2>
              <p className="text-muted-foreground">
                L'ensemble du contenu de ce site (textes, images, vidéos, logos, icônes, sons, logiciels, etc.) 
                est protégé par le droit d'auteur et le droit des marques. Toute reproduction, représentation, 
                modification, publication, adaptation de tout ou partie des éléments du site, quel que soit 
                le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">4. Limitation de responsabilité</h2>
              <p className="text-muted-foreground">
                Les informations contenues sur ce site sont aussi précises que possible et le site est 
                périodiquement mis à jour, mais peut toutefois contenir des inexactitudes, des omissions 
                ou des lacunes. L'éditeur ne pourra être tenu responsable des dommages directs et indirects 
                causés au matériel de l'utilisateur, lors de l'accès au site.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">5. Données personnelles</h2>
              <p className="text-muted-foreground">
                Pour plus d'informations sur la collecte et le traitement de vos données personnelles, 
                veuillez consulter notre{' '}
                <Link to="/confidentialite" className="text-primary hover:underline">
                  Politique de confidentialité
                </Link>.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-primary mb-4">6. Droit applicable</h2>
              <p className="text-muted-foreground">
                Les présentes mentions légales sont soumises au droit français. En cas de litige, 
                les tribunaux français seront seuls compétents.
              </p>
            </section>
          </div>

          <p className="text-sm text-muted-foreground mt-8 pt-8 border-t border-border">
            Dernière mise à jour : Janvier 2025
          </p>
        </Card>
      </div>
    </div>
  );
}

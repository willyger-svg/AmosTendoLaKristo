import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { BaseService, PublicServiceItem, Testimonial } from '../../types';
import {
  initialPrintingServices,
  initialPublicServices,
  initialTestimonials
} from '../seed/initialSeedData';

const SERVICES_COLLECTION = 'services';
const PUBLIC_SERVICES_COLLECTION = 'publicServices';
const TESTIMONIALS_COLLECTION = 'testimonials';

export const servicesCatalogService = {
  /**
   * Fetch all printing, typing and document services from Firestore
   */
  async getPrintingServices(): Promise<BaseService[]> {
    try {
      const colRef = collection(db, SERVICES_COLLECTION);
      const snapshot = await getDocs(colRef);

      if (snapshot.empty) {
        await this.seedServicesIfEmpty();
        return initialPrintingServices.filter(s => s.category === 'Printing');
      }

      const services: BaseService[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        services.push({
          id: docSnap.id,
          slug: data.slug || docSnap.id,
          title: data.title || '',
          category: data.category || 'Printing',
          shortDescription: data.shortDescription || '',
          description: data.description || '',
          turnaroundTime: data.turnaroundTime || 'Same Day',
          pricingLabel: data.pricingLabel || '',
          startingPrice: Number(data.startingPrice) || 0,
          iconName: data.iconName || 'Printer',
          features: Array.isArray(data.features) ? data.features : [],
          requirements: Array.isArray(data.requirements) ? data.requirements : [],
          disclaimer: data.disclaimer || ''
        });
      });

      return services;
    } catch (err) {
      console.warn('Error fetching printing services from Firestore, using baseline catalog:', err);
      return initialPrintingServices.filter(s => s.category === 'Printing');
    }
  },

  /**
   * Fetch document typing, CV and formatting services from Firestore
   */
  async getDocumentServices(): Promise<BaseService[]> {
    try {
      const services = await this.getPrintingServices();
      // Returns services with document or typing relevance, or full catalog
      return services.slice(0, 6);
    } catch (err) {
      console.warn('Error fetching document services:', err);
      return initialPrintingServices.slice(0, 6);
    }
  },

  /**
   * Fetch all public and government portal assistance services from Firestore
   */
  async getPublicServices(agencyCode?: string): Promise<PublicServiceItem[]> {
    try {
      const colRef = collection(db, PUBLIC_SERVICES_COLLECTION);
      const snapshot = await getDocs(colRef);

      if (snapshot.empty) {
        await this.seedServicesIfEmpty();
        const base = initialPublicServices;
        if (!agencyCode || agencyCode === 'ALL') return base;
        return base.filter(s => agencyCode === 'OTHER' ? s.code === 'OTHER' : s.code === agencyCode);
      }

      const services: PublicServiceItem[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        services.push({
          id: docSnap.id,
          slug: data.slug || docSnap.id,
          code: data.code || 'OTHER',
          title: data.title || '',
          agencyName: data.agencyName || '',
          officialPortalUrlPlaceholder: data.officialPortalUrlPlaceholder || '',
          shortDescription: data.shortDescription || '',
          fullDescription: data.fullDescription || '',
          typicalRequirements: Array.isArray(data.typicalRequirements) ? data.typicalRequirements : [],
          estimatedAssistanceTime: data.estimatedAssistanceTime || '',
          tkAssistanceFeeNote: data.tkAssistanceFeeNote || '',
          officialGovFeeNote: data.officialGovFeeNote || '',
          importantDisclaimer: data.importantDisclaimer || '',
          features: Array.isArray(data.features) ? data.features : [],
          icon: data.icon || 'ShieldCheck'
        });
      });

      if (!agencyCode || agencyCode === 'ALL') {
        return services;
      }
      return services.filter(s => agencyCode === 'OTHER' ? s.code === 'OTHER' : s.code === agencyCode);
    } catch (err) {
      console.warn('Error fetching public services from Firestore:', err);
      const base = initialPublicServices;
      if (!agencyCode || agencyCode === 'ALL') return base;
      return base.filter(s => agencyCode === 'OTHER' ? s.code === 'OTHER' : s.code === agencyCode);
    }
  },

  /**
   * Fetch customer testimonials from Firestore
   */
  async getTestimonials(): Promise<Testimonial[]> {
    try {
      const colRef = collection(db, TESTIMONIALS_COLLECTION);
      const snapshot = await getDocs(colRef);

      if (snapshot.empty) {
        await this.seedTestimonialsIfEmpty();
        return initialTestimonials;
      }

      const items: Testimonial[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          name: data.name || 'Mteja',
          role: data.role || 'Mteja wa TK Stationery',
          organization: data.organization || '',
          rating: Number(data.rating) || 5,
          comment: data.comment || '',
          date: data.date || '',
          serviceUsed: data.serviceUsed || 'Uchapaji'
        });
      });
      return items;
    } catch (err) {
      console.warn('Error fetching testimonials from Firestore:', err);
      return initialTestimonials;
    }
  },

  /**
   * Realtime listener for Printing / Core Services collection
   */
  listenToPrintingServices(callback: (services: BaseService[]) => void): Unsubscribe {
    const colRef = collection(db, SERVICES_COLLECTION);
    return onSnapshot(
      colRef,
      snapshot => {
        if (snapshot.empty) {
          this.seedServicesIfEmpty();
          callback(initialPrintingServices.filter(s => s.category === 'Printing'));
          return;
        }

        const list: BaseService[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            slug: data.slug || docSnap.id,
            title: data.title || '',
            category: data.category || 'Printing',
            shortDescription: data.shortDescription || '',
            description: data.description || '',
            turnaroundTime: data.turnaroundTime || 'Same Day',
            pricingLabel: data.pricingLabel || '',
            startingPrice: Number(data.startingPrice) || 0,
            iconName: data.iconName || 'Printer',
            features: Array.isArray(data.features) ? data.features : [],
            requirements: Array.isArray(data.requirements) ? data.requirements : [],
            disclaimer: data.disclaimer || ''
          });
        });
        callback(list);
      },
      error => {
        console.warn('Realtime listener error on services:', error);
        callback(initialPrintingServices.filter(s => s.category === 'Printing'));
      }
    );
  },

  /**
   * Realtime listener for Public / Government Services collection
   */
  listenToPublicServices(callback: (services: PublicServiceItem[]) => void): Unsubscribe {
    const colRef = collection(db, PUBLIC_SERVICES_COLLECTION);
    return onSnapshot(
      colRef,
      snapshot => {
        if (snapshot.empty) {
          this.seedServicesIfEmpty();
          callback(initialPublicServices);
          return;
        }

        const list: PublicServiceItem[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            slug: data.slug || docSnap.id,
            code: data.code || 'OTHER',
            title: data.title || '',
            agencyName: data.agencyName || '',
            officialPortalUrlPlaceholder: data.officialPortalUrlPlaceholder || '',
            shortDescription: data.shortDescription || '',
            fullDescription: data.fullDescription || '',
            typicalRequirements: Array.isArray(data.typicalRequirements) ? data.typicalRequirements : [],
            estimatedAssistanceTime: data.estimatedAssistanceTime || '',
            tkAssistanceFeeNote: data.tkAssistanceFeeNote || '',
            officialGovFeeNote: data.officialGovFeeNote || '',
            importantDisclaimer: data.importantDisclaimer || '',
            features: Array.isArray(data.features) ? data.features : [],
            icon: data.icon || 'ShieldCheck'
          });
        });
        callback(list);
      },
      error => {
        console.warn('Realtime listener error on public services:', error);
        callback(initialPublicServices);
      }
    );
  },

  /**
   * Realtime listener for Testimonials collection
   */
  listenToTestimonials(callback: (testimonials: Testimonial[]) => void): Unsubscribe {
    const colRef = collection(db, TESTIMONIALS_COLLECTION);
    return onSnapshot(
      colRef,
      snapshot => {
        if (snapshot.empty) {
          this.seedTestimonialsIfEmpty();
          callback(initialTestimonials);
          return;
        }
        const items: Testimonial[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            name: data.name || 'Mteja',
            role: data.role || 'Mteja wa TK Stationery',
            organization: data.organization || '',
            rating: Number(data.rating) || 5,
            comment: data.comment || '',
            date: data.date || '',
            serviceUsed: data.serviceUsed || 'Uchapaji'
          });
        });
        callback(items);
      },
      error => {
        console.warn('Realtime listener error on testimonials:', error);
        callback(initialTestimonials);
      }
    );
  },

  /**
   * Seed Firestore services collections if currently empty
   */
  async seedServicesIfEmpty(): Promise<void> {
    try {
      // 1. Seed Printing Services
      const servicesSnap = await getDocs(query(collection(db, SERVICES_COLLECTION), limit(1)));
      if (servicesSnap.empty) {
        for (const item of initialPrintingServices) {
          await setDoc(doc(db, SERVICES_COLLECTION, item.id), {
            ...item,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }

      // 2. Seed Public / Government Portal Services
      const publicSnap = await getDocs(query(collection(db, PUBLIC_SERVICES_COLLECTION), limit(1)));
      if (publicSnap.empty) {
        for (const item of initialPublicServices) {
          await setDoc(doc(db, PUBLIC_SERVICES_COLLECTION, item.id), {
            ...item,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.warn('Initial services seeding notice:', err);
    }
  },

  /**
   * Seed customer testimonials if empty
   */
  async seedTestimonialsIfEmpty(): Promise<void> {
    try {
      const snap = await getDocs(query(collection(db, TESTIMONIALS_COLLECTION), limit(1)));
      if (snap.empty) {
        for (const item of initialTestimonials) {
          await setDoc(doc(db, TESTIMONIALS_COLLECTION, item.id), {
            ...item,
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.warn('Testimonial seed notice:', err);
    }
  }
};

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

// Koleksiyon isimleri
export const COLLECTIONS = {
  USERS: 'users',
  COMPANIES: 'companies',
  CAMPAIGNS: 'campaigns',
  REVIEWS: 'reviews',
  ACCOUNTING: 'accounting'
};

// Genel CRUD işlemleri
export class FirestoreService {
  // Tüm dökümanları getir
  static async getAll(collectionName: string) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      }));
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  }

  // Tek döküman getir
  static async getById(collectionName: string, id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...(docSnap.data() as any) };
      } else {
        throw new Error('Document not found');
      }
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  // Yeni döküman ekle
  static async add(collectionName: string, data: any) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }

  // Döküman güncelle
  static async update(collectionName: string, id: string, data: any) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  // Döküman sil
  static async delete(collectionName: string, id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Sorgu ile dökümanları getir
  static async query(collectionName: string, conditions: any[] = [], orderByField?: string, limitCount?: number) {
    try {
      let q: any = collection(db, collectionName);
      
      // Koşulları ekle
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
      
      // Sıralama ekle
      if (orderByField) {
        q = query(q, orderBy(orderByField, 'desc'));
      }
      
      // Limit ekle
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      }));
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  }

  // Gerçek zamanlı dinleme
  static subscribeToCollection(collectionName: string, callback: (data: any[]) => void) {
    return onSnapshot(collection(db, collectionName), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      }));
      callback(data);
    });
  }

  // Toplu işlemler
  static async batchUpdate(updates: Array<{collection: string, id: string, data: any}>) {
    try {
      const batch = writeBatch(db);
      
      updates.forEach(({ collection, id, data }) => {
        const docRef = doc(db, collection, id);
        batch.update(docRef, {
          ...data,
          updatedAt: Timestamp.now()
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error in batch update:', error);
      throw error;
    }
  }
}

// Özel servisler
export class UserService {
  static async getAllUsers() {
    return await FirestoreService.getAll(COLLECTIONS.USERS);
  }

  static async getUserById(id: string) {
    return await FirestoreService.getById(COLLECTIONS.USERS, id);
  }

  static async updateUser(id: string, data: any) {
    return await FirestoreService.update(COLLECTIONS.USERS, id, data);
  }

  static async deleteUser(id: string) {
    return await FirestoreService.delete(COLLECTIONS.USERS, id);
  }
}

export class CompanyService {
  static async getAllCompanies() {
    return await FirestoreService.getAll(COLLECTIONS.COMPANIES);
  }

  static async getCompanyById(id: string) {
    return await FirestoreService.getById(COLLECTIONS.COMPANIES, id);
  }

  static async updateCompany(id: string, data: any) {
    return await FirestoreService.update(COLLECTIONS.COMPANIES, id, data);
  }

  static async deleteCompany(id: string) {
    return await FirestoreService.delete(COLLECTIONS.COMPANIES, id);
  }
}

export class CampaignService {
  static async getAllCampaigns() {
    return await FirestoreService.getAll(COLLECTIONS.CAMPAIGNS);
  }

  static async getCampaignById(id: string) {
    return await FirestoreService.getById(COLLECTIONS.CAMPAIGNS, id);
  }

  static async updateCampaign(id: string, data: any) {
    return await FirestoreService.update(COLLECTIONS.CAMPAIGNS, id, data);
  }

  static async deleteCampaign(id: string) {
    return await FirestoreService.delete(COLLECTIONS.CAMPAIGNS, id);
  }
}

export class ReviewService {
  static async getAllReviews() {
    return await FirestoreService.getAll(COLLECTIONS.REVIEWS);
  }

  static async getReviewById(id: string) {
    return await FirestoreService.getById(COLLECTIONS.REVIEWS, id);
  }

  static async updateReview(id: string, data: any) {
    return await FirestoreService.update(COLLECTIONS.REVIEWS, id, data);
  }

  static async deleteReview(id: string) {
    return await FirestoreService.delete(COLLECTIONS.REVIEWS, id);
  }
}

export class AccountingService {
  static async getAllAccountingData() {
    return await FirestoreService.getAll(COLLECTIONS.ACCOUNTING);
  }

  static async getAccountingById(id: string) {
    return await FirestoreService.getById(COLLECTIONS.ACCOUNTING, id);
  }

  static async updateAccounting(id: string, data: any) {
    return await FirestoreService.update(COLLECTIONS.ACCOUNTING, id, data);
  }

  static async deleteAccounting(id: string) {
    return await FirestoreService.delete(COLLECTIONS.ACCOUNTING, id);
  }
} 
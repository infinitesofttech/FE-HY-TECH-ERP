import { Village, FamilyTreeNodeData, GovDocumentItem, Customer, RelationshipType } from '@/types';
import { MOCK_VILLAGES, MOCK_CUSTOMERS, MOCK_FAMILY_TREES } from '../mockData';

let villagesData = [...MOCK_VILLAGES];
let familyTreesData = { ...MOCK_FAMILY_TREES };

export const villageService = {
  async getVillages(): Promise<Village[]> {
    return Promise.resolve(villagesData);
  },

  async createVillage(newVillage: {
    name: string;
    name_gu?: string;
    code?: string;
    taluka: string;
    district: string;
    total_families?: number;
    total_citizens?: number;
    total_documents?: number;
    male_count?: number;
    female_count?: number;
  }): Promise<{ message: string; village: Village }> {
    const nextId = villagesData.length > 0 ? Math.max(...villagesData.map((v) => v.id)) + 1 : 1;
    const code = newVillage.code?.trim() || `VIL-${String(nextId).padStart(3, '0')}`;
    const totalCitizens = Number(newVillage.total_citizens) || 0;

    const created: Village = {
      id: nextId,
      code: code.toUpperCase(),
      name: newVillage.name.trim(),
      name_gu: newVillage.name_gu?.trim() || newVillage.name.trim(),
      taluka: newVillage.taluka.trim(),
      district: newVillage.district.trim(),
      total_families: Number(newVillage.total_families) || 0,
      total_citizens: totalCitizens,
      total_documents: Number(newVillage.total_documents) || 0,
      male_count: Number(newVillage.male_count) || Math.floor(totalCitizens / 2),
      female_count: Number(newVillage.female_count) || Math.ceil(totalCitizens / 2),
      is_active: true,
    };

    villagesData = [created, ...villagesData];
    return Promise.resolve({ message: 'Village created successfully', village: created });
  },

  async getVillageByCodeOrName(identifier: string): Promise<Village | undefined> {
    const norm = identifier.toLowerCase();
    return Promise.resolve(
      villagesData.find(
        (v) => v.code.toLowerCase() === norm || v.name.toLowerCase() === norm || v.name_gu.toLowerCase() === norm
      )
    );
  },

  async getVillageFamilies(villageName: string): Promise<Customer[]> {
    const norm = villageName.toLowerCase();
    const matched = MOCK_CUSTOMERS.filter(
      (c) => c.village_city.toLowerCase().includes(norm) || norm.includes(c.village_city.toLowerCase())
    );
    if (matched.length > 0) return Promise.resolve(matched);
    return Promise.resolve(MOCK_CUSTOMERS.slice(0, 3));
  },

  async getFamilyTree(familyId: string): Promise<{ head: FamilyTreeNodeData; spouse?: FamilyTreeNodeData; children: FamilyTreeNodeData[] } | undefined> {
    return Promise.resolve(familyTreesData[familyId] || familyTreesData['HTF-000002']);
  },

  async updateMemberDoc(
    familyId: string,
    memberId: number,
    docId: string,
    newStatus: GovDocumentItem['status'],
    fileUrl?: string,
    docNo?: string
  ): Promise<{ message: string; doc: GovDocumentItem }> {
    const tree = familyTreesData[familyId] || familyTreesData['HTF-000002'];
    const allMembers = [tree.head, ...(tree.spouse ? [tree.spouse] : []), ...tree.children];
    const member = allMembers.find((m) => m.id === memberId);

    if (!member) throw new Error('Member not found');
    const doc = member.documents.find((d) => d.id === docId);
    if (!doc) throw new Error('Document not found');

    doc.status = newStatus;
    if (fileUrl) doc.file_url = fileUrl;
    if (docNo) doc.document_no = docNo;
    doc.uploaded_date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    member.documents_verified = member.documents.filter((d) => d.status === 'VERIFIED').length;
    return Promise.resolve({ message: 'Document updated successfully', doc });
  },

  async addMemberRelation(
    familyId: string,
    newMember: {
      name: string;
      relationship: RelationshipType;
      gender: 'MALE' | 'FEMALE' | 'OTHER';
      birth_date: string;
      mobile_number: string;
    }
  ): Promise<{ message: string; member: FamilyTreeNodeData }> {
    const tree = familyTreesData[familyId] || familyTreesData['HTF-000002'];
    const newId = Math.floor(Math.random() * 9000) + 1000;
    const age = new Date().getFullYear() - new Date(newMember.birth_date).getFullYear();

    const createdNode: FamilyTreeNodeData = {
      id: newId,
      family_id: familyId,
      name: newMember.name,
      relationship: newMember.relationship,
      relationship_display: newMember.relationship,
      gender: newMember.gender,
      age: Math.max(1, age),
      birth_date: newMember.birth_date,
      mobile_number: newMember.mobile_number,
      is_head: false,
      is_active: true,
      generation: 3,
      parent_id: tree.head.id,
      documents_verified: 0,
      documents_total: 8,
      documents: [
        {
          id: `doc-${newId}-1`,
          title: 'Aadhaar Card',
          title_gu: 'આધાર કાર્ડ',
          type: 'AADHAR',
          status: 'MISSING',
          is_required: true,
        },
        {
          id: `doc-${newId}-2`,
          title: 'PAN Card',
          title_gu: 'પાન કાર્ડ',
          type: 'PAN',
          status: 'MISSING',
          is_required: true,
        },
        {
          id: `doc-${newId}-3`,
          title: 'Voter ID (Election Card)',
          title_gu: 'ચૂંટણી ઓળખકાર્ડ',
          type: 'VOTER_ID',
          status: 'MISSING',
          is_required: true,
        },
        {
          id: `doc-${newId}-4`,
          title: 'Ration Card',
          title_gu: 'રેશન કાર્ડ',
          type: 'RATION_CARD',
          status: 'MISSING',
          is_required: true,
        },
      ],
    };

    if (newMember.relationship === 'WIFE' || newMember.relationship === 'HUSBAND') {
      tree.spouse = createdNode;
    } else {
      tree.children.push(createdNode);
    }

    return Promise.resolve({ message: 'Family relation added to tree successfully', member: createdNode });
  },
};

/**
 * Sprint 6 Automated Verification Suite
 * =====================================
 * Validates:
 * 1. SAK Financial Statements (Laba Rugi, Posisi Keuangan / Neraca, Arus Kas)
 *    - AC 1: Neraca Seimbang (Total Aset = Total Liabilitas + Ekuitas, isBalanced: true)
 * 2. Official Financial Export (PDF berstempel audit CPA & Excel/CSV spreadsheet)
 * 3. Oriental Learn Courses, Offline Workshops (Makassar & Bone with quota tracking)
 * 4. Quiz Competency & Digital Certificate Generation (AC 2: Score > 80% issues e-certificate, <= 80% rejected)
 */

const http = require('http');

const API_BASE = 'http://localhost:4000/api/v1';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✓ ${message}`);
  }
}

async function runSprint6Tests() {
  console.log('===============================================================');
  console.log('🧪 RUNNING SPRINT 6 VERIFICATION TEST SUITE');
  console.log('===============================================================\n');

  // -------------------------------------------------------------------------
  // TEST 1: SAK Financial Reports & Acceptance Criteria 1 (Neraca Seimbang)
  // -------------------------------------------------------------------------
  console.log('--- TEST GROUP 1: SAK Financial Statements & Neraca Balance (AC 1) ---');
  const reportsRes = await request('GET', '/accounting/sak-reports');
  assert(reportsRes.status === 200, 'GET /accounting/sak-reports returns HTTP 200');

  const { incomeStatement, balanceSheet, cashFlowStatement } = reportsRes.body;
  assert(incomeStatement !== undefined, 'Income Statement (Laba Rugi) exists in SAK reports');
  assert(balanceSheet !== undefined, 'Balance Sheet (Neraca) exists in SAK reports');
  assert(cashFlowStatement !== undefined, 'Cash Flow Statement (Arus Kas) exists in SAK reports');

  // Verify Laba Rugi Mathematical Consistency
  console.log('\n  Checking SAK Laba Rugi Formula:');
  const expectedGross = incomeStatement.revenue.totalRevenue - incomeStatement.cogs.costOfGoodsSold;
  assert(
    incomeStatement.cogs.grossProfit === expectedGross,
    `Gross Profit (Rp ${incomeStatement.cogs.grossProfit.toLocaleString('id-ID')}) = Total Revenue - COGS`,
  );

  const expectedNet = incomeStatement.cogs.grossProfit - incomeStatement.operatingExpenses.totalExpenses;
  assert(
    incomeStatement.netOperatingProfit === expectedNet,
    `Net Operating Profit (Rp ${incomeStatement.netOperatingProfit.toLocaleString('id-ID')}) = Gross Profit - Operating Expenses`,
  );

  // Verify Neraca Balance Invariant (AC 1: Total Aset = Total Liabilitas + Total Ekuitas)
  console.log('\n  Checking SAK Neraca Invariant (AC 1):');
  const totalAssets = balanceSheet.assets.totalAssets;
  const totalLiabilities = balanceSheet.liabilitiesAndEquity.liabilities.totalLiabilities;
  const totalEquity = balanceSheet.liabilitiesAndEquity.equity.totalEquity;
  const totalLiabilitiesAndEquity = balanceSheet.liabilitiesAndEquity.totalLiabilitiesAndEquity;

  console.log(`    Total Aset: Rp ${totalAssets.toLocaleString('id-ID')}`);
  console.log(`    Total Liabilitas: Rp ${totalLiabilities.toLocaleString('id-ID')}`);
  console.log(`    Total Ekuitas: Rp ${totalEquity.toLocaleString('id-ID')}`);
  console.log(`    Total Liabilitas + Ekuitas: Rp ${totalLiabilitiesAndEquity.toLocaleString('id-ID')}`);

  assert(
    totalLiabilities + totalEquity === totalLiabilitiesAndEquity,
    'Liabilities + Equity correctly sums to totalLiabilitiesAndEquity',
  );
  assert(
    totalAssets === totalLiabilitiesAndEquity,
    `AC 1 PASSED: Total Aset (Rp ${totalAssets}) == Total Liabilitas + Ekuitas (Rp ${totalLiabilitiesAndEquity})`,
  );
  assert(
    balanceSheet.isBalanced === true,
    'AC 1 PASSED: balanceSheet.isBalanced is strictly TRUE',
  );

  // Verify Cash Flow Statement
  console.log('\n  Checking SAK Cash Flow Statement:');
  assert(cashFlowStatement.endingCashBalance > 0, 'Cash Flow has positive ending cash balance');
  assert(cashFlowStatement.operatingActivities > 0, 'Operating cash flow is positive');

  // -------------------------------------------------------------------------
  // TEST 2: Official Financial Export (PDF & Excel)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: Financial Report Export (PDF & Excel) ---');
  const exportPdfRes = await request('GET', '/accounting/export?format=PDF&statementType=NERACA');
  assert(exportPdfRes.status === 200, 'GET /accounting/export (PDF) returns HTTP 200');
  assert(exportPdfRes.body.format === 'PDF', 'Export response format is PDF');
  assert(
    exportPdfRes.body.auditSignOff.isBalancedVerified === true,
    'Export PDF metadata verifies Neraca is balanced',
  );
  assert(
    exportPdfRes.body.auditSignOff.accountantCertificationNumber.includes('CPA-SAK'),
    'Export PDF signed off by registered CPA with official certificate',
  );

  const exportExcelRes = await request('GET', '/accounting/export?format=EXCEL&statementType=LABA_RUGI');
  assert(exportExcelRes.status === 200, 'GET /accounting/export (EXCEL) returns HTTP 200');
  assert(exportExcelRes.body.format === 'EXCEL', 'Export response format is EXCEL');

  // -------------------------------------------------------------------------
  // TEST 3: Oriental Learn Modules Catalog
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: Oriental Learn Course Modules ---');
  const coursesRes = await request('GET', '/accounting/learn/courses');
  assert(coursesRes.status === 200, 'GET /accounting/learn/courses returns HTTP 200');
  assert(Array.isArray(coursesRes.body), 'Courses response is an array');
  assert(coursesRes.body.length >= 3, `Found ${coursesRes.body.length} courses (at least 3 required)`);

  const sAKCourse = coursesRes.body.find((c) => c.category === 'FOOD_COSTING');
  const wasteCourse = coursesRes.body.find((c) => c.category === 'SANITASI_WASTE');
  const mktCourse = coursesRes.body.find((c) => c.category === 'DIGITAL_MARKETING');

  assert(sAKCourse !== undefined, 'Course on SAK & Food Costing exists');
  assert(wasteCourse !== undefined, 'Course on Sanitasi & Jelantah UCO exists');
  assert(mktCourse !== undefined, 'Course on Digital Marketing & Referral exists');
  assert(sAKCourse.quizQuestions.length >= 2, 'Course has interactive quiz questions');

  // -------------------------------------------------------------------------
  // TEST 4: Quiz Grading & Strict > 80% Digital Certificate Issuance (AC 2)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 4: Quiz Competency & E-Certificate Generation (AC 2) ---');

  // Case A: Failing score (<= 80%)
  console.log('  Testing Sub-case A: Submitting wrong answers (Score <= 80%)');
  const failSubmission = {
    courseId: sAKCourse.id,
    memberId: '820199200001',
    memberName: 'Bpk. Ahmad Fauzi (Test UKM)',
    answers: [0, 0], // both wrong
  };
  const failRes = await request('POST', '/accounting/learn/quiz/submit', failSubmission);
  assert(failRes.status === 201 || failRes.status === 200, 'Quiz submit returns 200/201');
  assert(failRes.body.scorePct <= 80, `Score is ${failRes.body.scorePct}% (<= 80%)`);
  assert(failRes.body.passed === false, 'AC 2: passed is FALSE when score <= 80%');
  assert(
    failRes.body.certificate === undefined || failRes.body.certificate === null,
    'AC 2: No digital certificate is issued when score <= 80%',
  );
  assert(
    failRes.body.feedback.includes('> 80%'),
    'AC 2: Feedback explicitly informs participant of > 80% passing threshold',
  );

  // Case B: Passing score (> 80%)
  console.log('\n  Testing Sub-case B: Submitting 100% correct answers (Score > 80%)');
  const passSubmission = {
    courseId: sAKCourse.id,
    memberId: '820199200001',
    memberName: 'Bpk. Ahmad Fauzi (Test UKM)',
    answers: sAKCourse.quizQuestions.map((q) => q.correctAnswerIndex),
  };
  const passRes = await request('POST', '/accounting/learn/quiz/submit', passSubmission);
  assert(passRes.status === 201 || passRes.status === 200, 'Quiz submit returns 200/201');
  assert(passRes.body.scorePct === 100, `Score is 100% (> 80%)`);
  assert(passRes.body.passed === true, 'AC 2: passed is TRUE when score > 80%');
  assert(passRes.body.certificate !== undefined && passRes.body.certificate !== null, 'AC 2: Digital Certificate is ISSUED');

  const cert = passRes.body.certificate;
  console.log(`    Certificate Number: ${cert.certificateNumber}`);
  console.log(`    Verification Hash: ${cert.verificationHash}`);
  console.log(`    QR Code URL: ${cert.qrCodeUrl}`);

  assert(
    cert.certificateNumber.startsWith('CERT-ORT-'),
    'Certificate number has official format CERT-ORT-YYYYMM-XXXX',
  );
  assert(
    cert.qrCodeUrl.includes(cert.certificateNumber),
    'QR Code URL contains valid certificate verification route',
  );
  assert(
    cert.verificationHash.startsWith('SHA256-'),
    'Certificate has cryptographic SHA256 integrity hash',
  );
  assert(
    cert.scorePct > 80,
    `Certificate confirms score ${cert.scorePct}% > 80%`,
  );

  // Case C: Member Certificates Retrieval
  console.log('\n  Testing Sub-case C: Retrieving member certificates gallery');
  const certsRes = await request('GET', `/accounting/learn/certificates/${encodeURIComponent('820199200001')}`);
  assert(certsRes.status === 200, 'GET /accounting/learn/certificates/:id returns 200');
  assert(Array.isArray(certsRes.body), 'Member certificates is an array');
  assert(certsRes.body.length >= 1, 'Member has at least 1 issued certificate in database');
  assert(
    certsRes.body.some((c) => c.certificateNumber === cert.certificateNumber),
    'Newly issued certificate is retrieved in member gallery',
  );

  // -------------------------------------------------------------------------
  // TEST 5: Offline Workshops (Makassar & Bone with Quota Tracking)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 5: Offline Workshops Tatap Muka (Makassar & Bone) ---');
  const workshopsRes = await request('GET', '/accounting/learn/workshops');
  assert(workshopsRes.status === 200, 'GET /accounting/learn/workshops returns 200');
  assert(Array.isArray(workshopsRes.body), 'Workshops is an array');

  const makassarWorkshop = workshopsRes.body.find((w) => w.location.includes('Makassar'));
  const boneWorkshop = workshopsRes.body.find((w) => w.location.includes('Bone'));

  assert(makassarWorkshop !== undefined, 'Offline workshop in Makassar exists');
  assert(boneWorkshop !== undefined, 'Offline workshop in Bone exists');

  console.log(`    Makassar: ${makassarWorkshop.registeredCount} / ${makassarWorkshop.quota} registered`);
  console.log(`    Bone: ${boneWorkshop.registeredCount} / ${boneWorkshop.quota} registered`);

  // Register for Makassar
  console.log('\n  Registering attendee for Makassar workshop:');
  const regMakassarDto = {
    workshopId: makassarWorkshop.id,
    memberId: '820199200001',
    memberName: 'Bpk. Ahmad Fauzi',
    phone: '0812-4455-6677',
    businessName: 'Warung Berkah Makassar',
  };
  const regMksRes = await request('POST', '/accounting/learn/workshops/register', regMakassarDto);
  assert(regMksRes.status === 201 || regMksRes.status === 200, 'Workshop registration returns 200/201');
  assert(regMksRes.body.success === true, 'Registration marked as success');
  assert(regMksRes.body.registrationId.startsWith('REG-WKS-'), 'Registration ID generated');
  assert(regMksRes.body.status === 'CONFIRMED', 'Registration status is CONFIRMED');

  // Verify quota updated
  const workshopsAfter = await request('GET', '/accounting/learn/workshops');
  const mksAfter = workshopsAfter.body.find((w) => w.id === makassarWorkshop.id);
  assert(
    mksAfter.registeredCount === makassarWorkshop.registeredCount + 1,
    `Makassar registered quota incremented by 1 (${makassarWorkshop.registeredCount} -> ${mksAfter.registeredCount})`,
  );

  console.log('\n===============================================================');
  console.log('🎉 ALL SPRINT 6 TESTS PASSED! (100% SUCCESS)');
  console.log('  - AC 1: SAK Balance Sheet is Balanced (Total Assets === Liabilities + Equity)');
  console.log('  - AC 2: Quiz Score > 80% issues Digital Certificate with QR verification');
  console.log('===============================================================\n');
}

runSprint6Tests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

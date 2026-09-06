import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    Input,
  } from "../../components/ui";
  
  export function ComponentsPreviewPage() {
    return (
      <main className="min-h-screen bg-[var(--background)] p-6 md:p-8">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Page title */}
          <section>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              اختبار المكونات المشتركة
            </h1>
  
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              صفحة مؤقتة للتأكد من عمل مكونات الواجهة قبل استخدامها في الصفحات
              الأساسية.
            </p>
          </section>
  
          {/* Buttons */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Button
              </h2>
            </CardHeader>
  
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">حفظ</Button>
  
                <Button variant="secondary">إلغاء</Button>
  
                <Button variant="ghost">عرض التفاصيل</Button>
  
                <Button variant="danger">حذف</Button>
  
                <Button size="sm">صغير</Button>
  
                <Button size="lg">كبير</Button>
  
                <Button disabled>معطل</Button>
              </div>
            </CardContent>
          </Card>
  
          {/* Input */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Input
              </h2>
            </CardHeader>
  
            <CardContent>
              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  id="normal-input"
                  label="اسم الطالب"
                  placeholder="أدخل اسم الطالب"
                />
  
                <Input
                  id="helper-input"
                  label="رقم الطالب"
                  placeholder="مثال: 1025"
                  helperText="يمكن استخدام رقم الطالب للبحث السريع."
                />
  
                <Input
                  id="error-input"
                  label="البريد الإلكتروني"
                  placeholder="example@school.com"
                  error="يرجى إدخال بريد إلكتروني صحيح."
                />
  
                <Input
                  id="disabled-input"
                  label="حقل معطل"
                  placeholder="غير متاح حاليًا"
                  disabled
                />
              </div>
            </CardContent>
          </Card>
  
          {/* Card */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Card
              </h2>
            </CardHeader>
  
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    إجمالي الطلاب
                  </p>
  
                  <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                    1,300
                  </p>
                </div>
  
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    المدارس
                  </p>
  
                  <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                    5
                  </p>
                </div>
  
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    المخالفات
                  </p>
  
                  <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                    248
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
  
          {/* Badge */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Badge
              </h2>
            </CardHeader>
  
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="default">افتراضي</Badge>
  
                <Badge variant="success">نشط</Badge>
                <Badge variant="warning">تحذير</Badge>

              <Badge variant="danger">مخالفة</Badge>

              <Badge variant="info">معلومات</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Combined example */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              مثال مركب
            </h2>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    أحمد محمد
                  </h3>

                  <Badge variant="success">نشط</Badge>
                </div>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  الصف التاسع — مدرسة الغسانية الأولى
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  التفاصيل
                </Button>

                <Button size="sm">إضافة مخالفة</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
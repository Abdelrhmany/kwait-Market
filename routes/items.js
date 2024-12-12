const express = require('express');
const router = express.Router();
const Item = require('../models/item'); // استيراد الموديل الخاص بالإعلانات
const rotapp = require('../app'); // استيراد الموديل الخاص بالإعلانات
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); // استمر في تنفيذ الكود التالي إذا كان المستخدم مسجل الدخول
  }
  res.redirect("/"); // أعد التوجيه إلى الصفحة الرئيسية إذا لم يكن المستخدم مسجل الدخول
}

// جلب جميع الإعلانات أو تصفية حسب الفئة
router.get('/',async (req, res, next) => {
  if(true){
    try {
      const { category, status, location } = req.query; // يمكنك تصفية الإعلانات حسب الفئة أو الموقع أو الحالة
      let query = {};
  
      if (category) {
        query.category = category;
      }
      if (status) {
        query.status = status;
      }
      if (location) {
        query.location = location;
      }
  
      const items = await Item.find(query);
      res.json(items);
    } catch (error) {
      next(error);
    }
   }else{ 
  res.redirect("/");}
});


// POST request لإنشاء عنصر جديد




router.post('/', async (req, res, next) => {
if(req.isAuthenticated){

  try {
    const { title, description, price, location, category, condition, postedBy, images, additionalDetails } = req.body;

    const newItem = new Item({
      title,
      description,
      price,
      location,
      category,
      condition,
      postedBy,
      images,
      additionalDetails
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    next(error);
  }
}else{res.redirect('/')}
});

// تحديث إعلان باستخدام ID (PUT)
router.put('/:id', async (req, res, next) => {
if(req.isAuthenticated){
  try {
    const { title, description, price, location, category, condition, status, additionalDetails } = req.body;

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        price,
        location,
        category,
        condition,
        status,
        additionalDetails
      },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(updatedItem);
  } catch (error) {
    next(error);
  }

}else(res.redirect('/'))
});

// حذف إعلان باستخدام ID (DELETE)
router.delete('/:id', async (req, res, next) => {
 if(req.isAuthenticated){
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully', deletedItem });
  } catch (error) {
    next(error);
  } 
}else{
  res.redirect('/')
 }

});

// جلب إعلان باستخدام ID (GET)
router.get('/:id', async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // تحديث عدد المشاهدات
    item.views += 1;
    await item.save();

    res.json(item);
  } catch (error) {
    next(error);
  }
});
module.exports = router;
